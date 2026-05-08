import { createServer } from "node:http";
import { URL } from "node:url";
import { createJogadorSchema, listJogadoresQuerySchema } from "./contracts/jogador";
import {
  cobrarInadimplentesSchema,
  createPagamentoSchema,
  listPagamentosQuerySchema,
  markPagamentoPagoSchema,
  updatePagamentoSchema,
} from "./contracts/pagamento";
import { dispatchPresenceSchema, listLogsQuerySchema, webhookMessageSchema } from "./contracts/presenca";
import { runJobSchema } from "./contracts/jobs";
import { generateTeamsSchema } from "./contracts/times";
import { createTurmaSchema, listTurmasQuerySchema } from "./contracts/turma";
import { handleError, json, parseJsonBody } from "./core/http";
import { prisma } from "./core/prisma";
import { DashboardService } from "./modules/dashboard/dashboard.service";
import { EstatisticaService } from "./modules/estatisticas/estatistica.service";
import { PrismaGolRepository } from "./modules/gols/gol.repository";
import { GolService } from "./modules/gols/gol.service";
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

    const pagamentoPatchMatch = path.match(/^\/api\/pagamentos\/([^/]+)$/);
    if (method === "PATCH" && pagamentoPatchMatch) {
      const body: import("zod").infer<typeof updatePagamentoSchema> = updatePagamentoSchema.parse(
        await parseJsonBody(req)
      );
      json(res, 200, await pagamentoService.update(pagamentoPatchMatch[1]!, body));
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

    const pagamentoDeleteMatch = path.match(/^\/api\/pagamentos\/([^/]+)$/);
    if (method === "DELETE" && pagamentoDeleteMatch) {
      await pagamentoService.delete(pagamentoDeleteMatch[1]!);
      json(res, 200, { ok: true });
      return;
    }

    if (method === "POST" && path === "/api/pagamentos/cobrar-inadimplentes") {
      const body: import("zod").infer<typeof cobrarInadimplentesSchema> = cobrarInadimplentesSchema.parse(
        await parseJsonBody(req)
      );
      json(res, 200, await pagamentoService.cobrarInadimplentes(body));
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
