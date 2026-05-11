import { createServer } from "node:http";
import { URL } from "node:url";
import { createJogoSchema } from "./contracts/jogo";
import { createJogadorSchema, listJogadoresQuerySchema, updateJogadorSchema } from "./contracts/jogador";
import {
  cobrarInadimplentesSchema,
  createPagamentoSchema,
  listPagamentosQuerySchema,
  markPagamentoPagoSchema,
  updatePagamentoSchema,
} from "./contracts/pagamento";
import { dispatchPresenceSchema, listLogsQuerySchema, updatePresencaSchema, webhookMessageSchema } from "./contracts/presenca";
import { adaptEvolutionWebhook, adaptZApiWebhook } from "./modules/webhooks/webhook.adapters";
import { runJobSchema } from "./contracts/jobs";
import { generateTeamsSchema } from "./contracts/times";
import { createTurmaSchema, listTurmasQuerySchema, updateTurmaSchema } from "./contracts/turma";
import { handleError, json, parseJsonBody } from "./core/http";
import { prisma } from "./core/prisma";
import { DashboardService } from "./modules/dashboard/dashboard.service";
import { EstatisticaService } from "./modules/estatisticas/estatistica.service";
import { PrismaGolRepository } from "./modules/gols/gol.repository";
import { GolService } from "./modules/gols/gol.service";
import { JogoService } from "./modules/jogos/jogo.service";
import { PrismaJogadorRepository } from "./modules/jogadores/jogador.repository";
import { JogadorService } from "./modules/jogadores/jogador.service";
import { PrismaLogRepository } from "./modules/logs/log.repository";
import { PrismaPagamentoRepository } from "./modules/pagamentos/pagamento.repository";
import { PagamentoService } from "./modules/pagamentos/pagamento.service";
import { JobScheduler } from "./modules/jobs/job.scheduler";
import { MockJobRepository, PrismaJobRepository } from "./modules/jobs/job.repository";
import { JobService } from "./modules/jobs/job.service";
import {
  MockJogadorRepository,
  MockGolRepository,
  MockLogRepository,
  MockPagamentoRepository,
  MockPresencaRepository,
  MockTimeRepository,
  MockTurmaRepository,
} from "./mocks/mock-repositories";
import { PrismaPresencaRepository } from "./modules/presencas/presenca.repository";
import { PresencaService } from "./modules/presencas/presenca.service";
import { PrismaTimeRepository } from "./modules/times/time.repository";
import { TimeService } from "./modules/times/time.service";
import { PrismaTurmaRepository } from "./modules/turmas/turma.repository";
import { TurmaService } from "./modules/turmas/turma.service";

const env = {
  port: Number(process.env.PORT ?? "4000"),
  nodeEnv: process.env.NODE_ENV ?? "development",
  useMockData: process.env.USE_MOCK_DATA === "1" || !process.env.DATABASE_URL,
  enableWeeklyJobs: process.env.ENABLE_WEEKLY_JOBS === "1",
  jobsTickMs: Number(process.env.JOBS_TICK_MS ?? "30000"),
  cronSendConfirmation: process.env.CRON_SEND_CONFIRMATION ?? "0 20 * * 0",
  cronRemindPending: process.env.CRON_REMIND_PENDING ?? "0 18 * * 2",
  cronCloseList: process.env.CRON_CLOSE_LIST ?? "0 10 * * 3",
  cronGenerateTeams: process.env.CRON_GENERATE_TEAMS ?? "1 10 * * 3",
};

const turmaRepository = env.useMockData ? new MockTurmaRepository() : new PrismaTurmaRepository(prisma);
const jogadorRepository = env.useMockData ? new MockJogadorRepository() : new PrismaJogadorRepository(prisma);
const logRepository = env.useMockData ? new MockLogRepository() : new PrismaLogRepository(prisma);
const pagamentoRepository = env.useMockData ? new MockPagamentoRepository() : new PrismaPagamentoRepository(prisma);
const presencaRepository = env.useMockData ? new MockPresencaRepository() : new PrismaPresencaRepository(prisma);
const timeRepository = env.useMockData ? new MockTimeRepository() : new PrismaTimeRepository(prisma);
const golRepository = env.useMockData ? new MockGolRepository() : new PrismaGolRepository(prisma);
const jobRepository = env.useMockData ? new MockJobRepository() : new PrismaJobRepository(prisma);

const turmaService = new TurmaService(turmaRepository);
const jogadorService = new JogadorService(jogadorRepository);
const jogoService = new JogoService({ useMock: env.useMockData, prisma: env.useMockData ? undefined : prisma });
const estatisticaService = new EstatisticaService(
  golRepository,
  turmaRepository,
  jogadorRepository,
  presencaRepository
);
const dashboardService = new DashboardService({
  turmaRepository,
  jogadorRepository,
  pagamentoRepository,
  presencaRepository,
  estatisticaService,
  prisma: env.useMockData ? undefined : prisma,
  useMockData: env.useMockData,
});
const pagamentoService = new PagamentoService(
  pagamentoRepository,
  turmaRepository,
  jogadorRepository,
  logRepository
);
const timeService = new TimeService(timeRepository, logRepository);
const golService = new GolService(golRepository, logRepository);
const presencaService = new PresencaService(
  presencaRepository,
  logRepository,
  timeService,
  golService
);
const jobService = new JobService(jobRepository, presencaService, timeService, logRepository);
const jobScheduler = new JobScheduler(jobService, {
  enabled: env.enableWeeklyJobs,
  tickMs: env.jobsTickMs,
  jobs: [
    { name: "send_confirmation", cron: env.cronSendConfirmation },
    { name: "remind_pending", cron: env.cronRemindPending },
    { name: "close_list", cron: env.cronCloseList },
    { name: "generate_teams", cron: env.cronGenerateTeams },
  ],
});

const server = createServer(async (req, res) => {
  try {
    const method = req.method ?? "GET";
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const path = url.pathname;

    if (method === "GET" && path === "/health") {
      json(res, 200, {
        ok: true,
        service: "rachao-api",
        env: env.nodeEnv,
        mock: env.useMockData,
        jobsEnabled: env.enableWeeklyJobs,
      });
      return;
    }

    if (method === "GET" && path === "/api/dashboard") {
      json(res, 200, await dashboardService.getData());
      return;
    }

    if (method === "GET" && path === "/api/estatisticas") {
      json(res, 200, (await dashboardService.getData()).estatisticas);
      return;
    }

    if (method === "POST" && path === "/api/jobs/run") {
      const body: import("zod").infer<typeof runJobSchema> = runJobSchema.parse(await parseJsonBody(req));
      json(res, 200, await jobService.run(body.job, body.referenceDate ? new Date(body.referenceDate) : new Date()));
      return;
    }

    if (method === "GET" && path === "/api/turmas") {
      const query = listTurmasQuerySchema.parse({
        organizadorId: url.searchParams.get("organizadorId") ?? undefined,
      });
      json(res, 200, await turmaService.list(query));
      return;
    }

    if (method === "POST" && path === "/api/turmas") {
      const body: import("zod").infer<typeof createTurmaSchema> = createTurmaSchema.parse(
        await parseJsonBody(req)
      );
      json(res, 201, await turmaService.create(body));
      return;
    }

    const turmaIdMatch = path.match(/^\/api\/turmas\/([^/]+)$/);

    if (method === "PATCH" && turmaIdMatch) {
      const body: import("zod").infer<typeof updateTurmaSchema> = updateTurmaSchema.parse(
        await parseJsonBody(req)
      );
      json(res, 200, await turmaService.update(turmaIdMatch[1]!, body));
      return;
    }

    if (method === "GET" && path === "/api/jogadores") {
      const query = listJogadoresQuerySchema.parse({
        turmaId: url.searchParams.get("turmaId") ?? undefined,
      });
      json(res, 200, await jogadorService.list(query));
      return;
    }

    if (method === "POST" && path === "/api/jogadores") {
      const body: import("zod").infer<typeof createJogadorSchema> = createJogadorSchema.parse(
        await parseJsonBody(req)
      );
      json(res, 201, await jogadorService.create(body));
      return;
    }

    const jogadorIdMatch = path.match(/^\/api\/jogadores\/([^/]+)$/);

    if (method === "PATCH" && jogadorIdMatch) {
      const body: import("zod").infer<typeof updateJogadorSchema> = updateJogadorSchema.parse(
        await parseJsonBody(req)
      );
      json(res, 200, await jogadorService.update(jogadorIdMatch[1]!, body));
      return;
    }

    if (method === "DELETE" && jogadorIdMatch) {
      await jogadorService.delete(jogadorIdMatch[1]!);
      json(res, 200, { ok: true });
      return;
    }

    if (method === "POST" && path === "/api/jogos") {
      const body: import("zod").infer<typeof createJogoSchema> = createJogoSchema.parse(
        await parseJsonBody(req)
      );
      json(res, 201, await jogoService.create(body));
      return;
    }

    if (method === "GET" && path === "/api/pagamentos") {
      const query = listPagamentosQuerySchema.parse({
        turmaId: url.searchParams.get("turmaId") ?? undefined,
        referenciaMes: url.searchParams.get("referenciaMes") ?? undefined,
        referenciaAno: url.searchParams.get("referenciaAno") ?? undefined,
      });
      json(res, 200, await pagamentoService.list(query));
      return;
    }

    if (method === "POST" && path === "/api/pagamentos") {
      const body: import("zod").infer<typeof createPagamentoSchema> = createPagamentoSchema.parse(
        await parseJsonBody(req)
      );
      json(res, 201, await pagamentoService.create(body));
      return;
    }

    if (method === "POST" && path === "/api/pagamentos/cobrar-inadimplentes") {
      const body: import("zod").infer<typeof cobrarInadimplentesSchema> = cobrarInadimplentesSchema.parse(
        await parseJsonBody(req)
      );
      json(res, 200, await pagamentoService.cobrarInadimplentes(body));
      return;
    }

    const pagamentoPagoMatch = path.match(/^\/api\/pagamentos\/([^/]+)\/pagar$/);
    if (method === "PATCH" && pagamentoPagoMatch) {
      const body: import("zod").infer<typeof markPagamentoPagoSchema> = markPagamentoPagoSchema.parse(
        await parseJsonBody(req)
      );
      json(res, 200, await pagamentoService.markAsPaid(pagamentoPagoMatch[1]!, body.pagoEm));
      return;
    }

    const pagamentoIdMatch = path.match(/^\/api\/pagamentos\/([^/]+)$/);

    if (method === "PATCH" && pagamentoIdMatch) {
      const body: import("zod").infer<typeof updatePagamentoSchema> = updatePagamentoSchema.parse(
        await parseJsonBody(req)
      );
      json(res, 200, await pagamentoService.update(pagamentoIdMatch[1]!, body));
      return;
    }

    if (method === "DELETE" && pagamentoIdMatch) {
      await pagamentoService.delete(pagamentoIdMatch[1]!);
      json(res, 200, { ok: true });
      return;
    }

    const presencaIdMatch = path.match(/^\/api\/presencas\/([^/]+)$/);

    if (method === "PATCH" && presencaIdMatch) {
      const body: import("zod").infer<typeof updatePresencaSchema> = updatePresencaSchema.parse(
        await parseJsonBody(req)
      );
      await presencaRepository.updatePresenca(presencaIdMatch[1]!, body.resposta);
      json(res, 200, { ok: true });
      return;
    }

    if (method === "POST" && path === "/api/presencas/disparar") {
      const body: import("zod").infer<typeof dispatchPresenceSchema> = dispatchPresenceSchema.parse(
        await parseJsonBody(req)
      );
      json(res, 200, await presencaService.dispatchPresenceRequest(body));
      return;
    }

    if (method === "POST" && path === "/api/webhooks/whatsapp") {
      const body: import("zod").infer<typeof webhookMessageSchema> = webhookMessageSchema.parse(
        await parseJsonBody(req)
      );
      json(res, 200, await presencaService.receivePresenceWebhook(body));
      return;
    }

    if (method === "POST" && path === "/api/webhooks/zapi") {
      const raw = await parseJsonBody(req);
      const adapted = adaptZApiWebhook(raw);
      if (!adapted) {
        json(res, 200, { ok: true, ignored: true, reason: "Payload ignorado pelo adapter Z-API" });
        return;
      }
      json(res, 200, await presencaService.receivePresenceWebhook(adapted));
      return;
    }

    if (method === "POST" && path === "/api/webhooks/evolution") {
      const raw = await parseJsonBody(req);
      const adapted = adaptEvolutionWebhook(raw);
      if (!adapted) {
        json(res, 200, { ok: true, ignored: true, reason: "Payload ignorado pelo adapter Evolution" });
        return;
      }
      json(res, 200, await presencaService.receivePresenceWebhook(adapted));
      return;
    }

    if (method === "POST" && path === "/api/mocks/whatsapp") {
      const body: import("zod").infer<typeof webhookMessageSchema> = webhookMessageSchema.parse(
        await parseJsonBody(req)
      );
      json(
        res,
        200,
        await presencaService.receivePresenceWebhook({
          ...body,
          provider: "mock",
        })
      );
      return;
    }

    if (method === "GET" && path === "/api/logs") {
      const query = listLogsQuerySchema.parse({
        turmaId: url.searchParams.get("turmaId") ?? undefined,
        jogoId: url.searchParams.get("jogoId") ?? undefined,
        limit: url.searchParams.get("limit") ?? 20,
      });
      json(res, 200, await logRepository.list(query));
      return;
    }

    if (method === "POST" && path === "/api/times/gerar") {
      const body: import("zod").infer<typeof generateTeamsSchema> = generateTeamsSchema.parse(
        await parseJsonBody(req)
      );
      json(res, 200, await timeService.generate(body.jogoId, body.teamCount));
      return;
    }

    json(res, 404, { error: "Not found" });
  } catch (error) {
    handleError(res, error);
  }
});

server.listen(env.port, () => {
  jobScheduler.start();
  console.log(`API running on http://localhost:${env.port}`);
});
