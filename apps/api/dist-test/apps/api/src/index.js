"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const node_url_1 = require("node:url");
const jogador_1 = require("./contracts/jogador");
const pagamento_1 = require("./contracts/pagamento");
const presenca_1 = require("./contracts/presenca");
const jobs_1 = require("./contracts/jobs");
const times_1 = require("./contracts/times");
const turma_1 = require("./contracts/turma");
const http_1 = require("./core/http");
const prisma_1 = require("./core/prisma");
const dashboard_service_1 = require("./modules/dashboard/dashboard.service");
const estatistica_service_1 = require("./modules/estatisticas/estatistica.service");
const gol_repository_1 = require("./modules/gols/gol.repository");
const gol_service_1 = require("./modules/gols/gol.service");
const jogador_repository_1 = require("./modules/jogadores/jogador.repository");
const jogador_service_1 = require("./modules/jogadores/jogador.service");
const log_repository_1 = require("./modules/logs/log.repository");
const pagamento_repository_1 = require("./modules/pagamentos/pagamento.repository");
const pagamento_service_1 = require("./modules/pagamentos/pagamento.service");
const job_scheduler_1 = require("./modules/jobs/job.scheduler");
const job_repository_1 = require("./modules/jobs/job.repository");
const job_service_1 = require("./modules/jobs/job.service");
const mock_repositories_1 = require("./mocks/mock-repositories");
const presenca_repository_1 = require("./modules/presencas/presenca.repository");
const presenca_service_1 = require("./modules/presencas/presenca.service");
const time_repository_1 = require("./modules/times/time.repository");
const time_service_1 = require("./modules/times/time.service");
const turma_repository_1 = require("./modules/turmas/turma.repository");
const turma_service_1 = require("./modules/turmas/turma.service");
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
const turmaRepository = env.useMockData ? new mock_repositories_1.MockTurmaRepository() : new turma_repository_1.PrismaTurmaRepository(prisma_1.prisma);
const jogadorRepository = env.useMockData ? new mock_repositories_1.MockJogadorRepository() : new jogador_repository_1.PrismaJogadorRepository(prisma_1.prisma);
const logRepository = env.useMockData ? new mock_repositories_1.MockLogRepository() : new log_repository_1.PrismaLogRepository(prisma_1.prisma);
const pagamentoRepository = env.useMockData ? new mock_repositories_1.MockPagamentoRepository() : new pagamento_repository_1.PrismaPagamentoRepository(prisma_1.prisma);
const presencaRepository = env.useMockData ? new mock_repositories_1.MockPresencaRepository() : new presenca_repository_1.PrismaPresencaRepository(prisma_1.prisma);
const timeRepository = env.useMockData ? new mock_repositories_1.MockTimeRepository() : new time_repository_1.PrismaTimeRepository(prisma_1.prisma);
const golRepository = env.useMockData ? new mock_repositories_1.MockGolRepository() : new gol_repository_1.PrismaGolRepository(prisma_1.prisma);
const jobRepository = env.useMockData ? new job_repository_1.MockJobRepository() : new job_repository_1.PrismaJobRepository(prisma_1.prisma);
const turmaService = new turma_service_1.TurmaService(turmaRepository);
const jogadorService = new jogador_service_1.JogadorService(jogadorRepository);
const estatisticaService = new estatistica_service_1.EstatisticaService(golRepository, turmaRepository, jogadorRepository, presencaRepository);
const dashboardService = new dashboard_service_1.DashboardService({
    turmaRepository,
    jogadorRepository,
    pagamentoRepository,
    presencaRepository,
    estatisticaService,
    prisma: env.useMockData ? undefined : prisma_1.prisma,
    useMockData: env.useMockData,
});
const pagamentoService = new pagamento_service_1.PagamentoService(pagamentoRepository, turmaRepository, jogadorRepository, logRepository);
const timeService = new time_service_1.TimeService(timeRepository, logRepository);
const golService = new gol_service_1.GolService(golRepository, logRepository);
const presencaService = new presenca_service_1.PresencaService(presencaRepository, logRepository, timeService, golService);
const jobService = new job_service_1.JobService(jobRepository, presencaService, timeService, logRepository);
const jobScheduler = new job_scheduler_1.JobScheduler(jobService, {
    enabled: env.enableWeeklyJobs,
    tickMs: env.jobsTickMs,
    jobs: [
        { name: "send_confirmation", cron: env.cronSendConfirmation },
        { name: "remind_pending", cron: env.cronRemindPending },
        { name: "close_list", cron: env.cronCloseList },
        { name: "generate_teams", cron: env.cronGenerateTeams },
    ],
});
const server = (0, node_http_1.createServer)(async (req, res) => {
    try {
        const method = req.method ?? "GET";
        const url = new node_url_1.URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
        const path = url.pathname;
        if (method === "GET" && path === "/health") {
            (0, http_1.json)(res, 200, {
                ok: true,
                service: "rachao-api",
                env: env.nodeEnv,
                mock: env.useMockData,
                jobsEnabled: env.enableWeeklyJobs,
            });
            return;
        }
        if (method === "GET" && path === "/api/dashboard") {
            (0, http_1.json)(res, 200, await dashboardService.getData());
            return;
        }
        if (method === "GET" && path === "/api/estatisticas") {
            (0, http_1.json)(res, 200, (await dashboardService.getData()).estatisticas);
            return;
        }
        if (method === "POST" && path === "/api/jobs/run") {
            const body = jobs_1.runJobSchema.parse(await (0, http_1.parseJsonBody)(req));
            (0, http_1.json)(res, 200, await jobService.run(body.job, body.referenceDate ? new Date(body.referenceDate) : new Date()));
            return;
        }
        if (method === "GET" && path === "/api/turmas") {
            const query = turma_1.listTurmasQuerySchema.parse({
                organizadorId: url.searchParams.get("organizadorId") ?? undefined,
            });
            (0, http_1.json)(res, 200, await turmaService.list(query));
            return;
        }
        if (method === "POST" && path === "/api/turmas") {
            const body = turma_1.createTurmaSchema.parse(await (0, http_1.parseJsonBody)(req));
            (0, http_1.json)(res, 201, await turmaService.create(body));
            return;
        }
        if (method === "GET" && path === "/api/jogadores") {
            const query = jogador_1.listJogadoresQuerySchema.parse({
                turmaId: url.searchParams.get("turmaId") ?? undefined,
            });
            (0, http_1.json)(res, 200, await jogadorService.list(query));
            return;
        }
        if (method === "POST" && path === "/api/jogadores") {
            const body = jogador_1.createJogadorSchema.parse(await (0, http_1.parseJsonBody)(req));
            (0, http_1.json)(res, 201, await jogadorService.create(body));
            return;
        }
        if (method === "GET" && path === "/api/pagamentos") {
            const query = pagamento_1.listPagamentosQuerySchema.parse({
                turmaId: url.searchParams.get("turmaId") ?? undefined,
                referenciaMes: url.searchParams.get("referenciaMes") ?? undefined,
                referenciaAno: url.searchParams.get("referenciaAno") ?? undefined,
            });
            (0, http_1.json)(res, 200, await pagamentoService.list(query));
            return;
        }
        if (method === "POST" && path === "/api/pagamentos") {
            const body = pagamento_1.createPagamentoSchema.parse(await (0, http_1.parseJsonBody)(req));
            (0, http_1.json)(res, 201, await pagamentoService.create(body));
            return;
        }
        const pagamentoPatchMatch = path.match(/^\/api\/pagamentos\/([^/]+)$/);
        if (method === "PATCH" && pagamentoPatchMatch) {
            const body = pagamento_1.updatePagamentoSchema.parse(await (0, http_1.parseJsonBody)(req));
            (0, http_1.json)(res, 200, await pagamentoService.update(pagamentoPatchMatch[1], body));
            return;
        }
        const pagamentoPagoMatch = path.match(/^\/api\/pagamentos\/([^/]+)\/pagar$/);
        if (method === "PATCH" && pagamentoPagoMatch) {
            const body = pagamento_1.markPagamentoPagoSchema.parse(await (0, http_1.parseJsonBody)(req));
            (0, http_1.json)(res, 200, await pagamentoService.markAsPaid(pagamentoPagoMatch[1], body.pagoEm));
            return;
        }
        const pagamentoDeleteMatch = path.match(/^\/api\/pagamentos\/([^/]+)$/);
        if (method === "DELETE" && pagamentoDeleteMatch) {
            await pagamentoService.delete(pagamentoDeleteMatch[1]);
            (0, http_1.json)(res, 200, { ok: true });
            return;
        }
        if (method === "POST" && path === "/api/pagamentos/cobrar-inadimplentes") {
            const body = pagamento_1.cobrarInadimplentesSchema.parse(await (0, http_1.parseJsonBody)(req));
            (0, http_1.json)(res, 200, await pagamentoService.cobrarInadimplentes(body));
            return;
        }
        if (method === "POST" && path === "/api/presencas/disparar") {
            const body = presenca_1.dispatchPresenceSchema.parse(await (0, http_1.parseJsonBody)(req));
            (0, http_1.json)(res, 200, await presencaService.dispatchPresenceRequest(body));
            return;
        }
        if (method === "POST" && path === "/api/webhooks/whatsapp") {
            const body = presenca_1.webhookMessageSchema.parse(await (0, http_1.parseJsonBody)(req));
            (0, http_1.json)(res, 200, await presencaService.receivePresenceWebhook(body));
            return;
        }
        if (method === "POST" && path === "/api/mocks/whatsapp") {
            const body = presenca_1.webhookMessageSchema.parse(await (0, http_1.parseJsonBody)(req));
            (0, http_1.json)(res, 200, await presencaService.receivePresenceWebhook({
                ...body,
                provider: "mock",
            }));
            return;
        }
        if (method === "GET" && path === "/api/logs") {
            const query = presenca_1.listLogsQuerySchema.parse({
                turmaId: url.searchParams.get("turmaId") ?? undefined,
                jogoId: url.searchParams.get("jogoId") ?? undefined,
                limit: url.searchParams.get("limit") ?? 20,
            });
            (0, http_1.json)(res, 200, await logRepository.list(query));
            return;
        }
        if (method === "POST" && path === "/api/times/gerar") {
            const body = times_1.generateTeamsSchema.parse(await (0, http_1.parseJsonBody)(req));
            (0, http_1.json)(res, 200, await timeService.generate(body.jogoId, body.teamCount));
            return;
        }
        (0, http_1.json)(res, 404, { error: "Not found" });
    }
    catch (error) {
        (0, http_1.handleError)(res, error);
    }
});
server.listen(env.port, () => {
    jobScheduler.start();
    console.log(`API running on http://localhost:${env.port}`);
});
