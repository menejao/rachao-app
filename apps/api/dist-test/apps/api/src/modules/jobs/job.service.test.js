"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runJobServiceTests = runJobServiceTests;
const strict_1 = __importDefault(require("node:assert/strict"));
const job_scheduler_1 = require("./job.scheduler");
const job_service_1 = require("./job.service");
class FakeLogRepository {
    items = [];
    async create(input) {
        this.items.push(input.tipo);
    }
    async list() {
        return [];
    }
}
class FakeJobRepository {
    statuses = new Map([
        ["g1", "CONFIRMACAO_ABERTA"],
        ["g2", "FECHADO"],
    ]);
    async listScheduledTurmas() {
        return [
            {
                id: "t1",
                nome: "Quarta",
                diaSemana: 3,
                horario: "20:00",
                status: "ATIVA",
                whatsappGroupId: "group-1",
                whatsappProvider: "mock",
            },
        ];
    }
    async listPendingReminders() {
        return [
            {
                jogoId: "g1",
                turmaId: "t1",
                turmaNome: "Quarta",
                dataJogo: "2026-05-13T20:00:00.000Z",
                groupId: "group-1",
                provider: "mock",
                pendingPlayers: ["Leo"],
            },
        ];
    }
    async listGamesByStatuses(statuses) {
        return [...this.statuses.entries()]
            .filter(([, status]) => statuses.includes(status))
            .map(([jogoId, status]) => ({
            jogoId,
            turmaId: "t1",
            turmaNome: "Quarta",
            status: status,
            groupId: "group-1",
            provider: "mock",
            confirmedCount: 8,
        }));
    }
    async updateGameStatus(jogoId, status) {
        this.statuses.set(jogoId, status);
    }
}
class FakePresencaService {
    dispatches = [];
    async dispatchPresenceRequest(input) {
        this.dispatches.push(input.turmaId);
        return { ok: true };
    }
}
class FakeTimeService {
    generated = [];
    async generate(jogoId) {
        this.generated.push(jogoId);
        return [];
    }
}
async function runJobServiceTests() {
    const logs = new FakeLogRepository();
    const repository = new FakeJobRepository();
    const presencaService = new FakePresencaService();
    const timeService = new FakeTimeService();
    const service = new job_service_1.JobService(repository, presencaService, timeService, logs);
    const send = await service.run("send_confirmation", new Date("2026-05-10T20:00:00"));
    strict_1.default.equal(send.ok, true);
    strict_1.default.equal(presencaService.dispatches.length, 1);
    const close = await service.run("close_list", new Date("2026-05-13T10:00:00"));
    strict_1.default.equal(close.processed, 1);
    strict_1.default.equal(repository.statuses.get("g1"), "FECHADO");
    const generate = await service.run("generate_teams", new Date("2026-05-13T10:01:00"));
    strict_1.default.equal(generate.processed, 2);
    strict_1.default.deepEqual(timeService.generated.sort(), ["g1", "g2"]);
    const scheduler = new job_scheduler_1.JobScheduler(service, {
        enabled: true,
        tickMs: 1000,
        jobs: [{ name: "send_confirmation", cron: "0 20 * * 0" }],
    });
    await scheduler.tick(new Date("2026-05-10T20:00:00"));
    await scheduler.tick(new Date("2026-05-10T20:00:00"));
    strict_1.default.equal(presencaService.dispatches.length, 2);
}
