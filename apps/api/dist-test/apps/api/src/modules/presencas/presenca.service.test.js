"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPresencaServiceTests = runPresencaServiceTests;
const strict_1 = __importDefault(require("node:assert/strict"));
const gol_service_1 = require("../gols/gol.service");
const presenca_service_1 = require("./presenca.service");
class InMemoryLogRepository {
    items = [];
    async create(input) {
        this.items.push(input);
    }
    async list() {
        return [];
    }
}
class InMemoryPresencaRepository {
    responses = [];
    dispatched = false;
    async getDispatchContext() {
        return {
            turmaId: "t1",
            turmaNome: "Quarta",
            whatsappGroupId: "group-1",
            whatsappProvider: "mock",
            jogadores: [{ id: "j1", nome: "Pedro", telefone: "11999990000" }],
        };
    }
    async createOrOpenGame() {
        return { id: "g1", dataJogo: new Date("2026-05-14") };
    }
    async upsertPendingPresencas() {
        this.dispatched = true;
    }
    async resolveWebhookContext() {
        return {
            jogoId: "g1",
            turmaId: "t1",
            playerId: "j1",
            playerName: "Pedro",
        };
    }
    async resolveTimesCommandContext() {
        return {
            jogoId: "g1",
            turmaId: "t1",
        };
    }
    async savePresenceResponse(input) {
        this.responses.push(input);
    }
    async listForStats() {
        return [];
    }
}
class FakeTimeService {
    async generate() {
        return [
            { id: "time-1", nome: "Time Azul", nivelMedio: 4, jogadores: [] },
            { id: "time-2", nome: "Time Laranja", nivelMedio: 3, jogadores: [] },
        ];
    }
}
class InMemoryGolRepository {
    goals = 0;
    async resolveGoalCommandContext() {
        return {
            jogoId: "g1",
            turmaId: "t1",
            turmaNome: "Quarta",
            jogadorId: "j1",
            jogadorNome: "Pedro",
        };
    }
    async create() {
        this.goals += 1;
        return {
            id: "gol-1",
            jogoId: "g1",
            jogadorId: "j1",
            jogadorNome: "Pedro",
            turmaId: "t1",
            turmaNome: "Quarta",
            assistenciaId: null,
            assistenciaNome: null,
            minuto: null,
            createdAt: new Date().toISOString(),
        };
    }
    async list() {
        return [];
    }
}
async function runPresencaServiceTests() {
    const logs = new InMemoryLogRepository();
    const repository = new InMemoryPresencaRepository();
    const goalRepository = new InMemoryGolRepository();
    const service = new presenca_service_1.PresencaService(repository, logs, new FakeTimeService(), new gol_service_1.GolService(goalRepository, logs));
    const dispatch = await service.dispatchPresenceRequest({
        turmaId: "t1",
        dataJogo: "2026-05-14",
    });
    strict_1.default.equal(dispatch.ok, true);
    strict_1.default.equal(repository.dispatched, true);
    const webhook = await service.receivePresenceWebhook({
        provider: "mock",
        groupId: "group-1",
        fromPhone: "11999990000",
        message: "sim",
    });
    strict_1.default.equal(webhook.ok, true);
    strict_1.default.equal(repository.responses[0]?.resposta, "SIM");
    strict_1.default.ok(logs.items.length >= 2);
    const command = await service.receivePresenceWebhook({
        provider: "mock",
        groupId: "group-1",
        fromPhone: "11999990000",
        message: "/times",
    });
    strict_1.default.equal(command.ok, true);
    const goalCommand = await service.receivePresenceWebhook({
        provider: "mock",
        groupId: "group-1",
        fromPhone: "11999990000",
        message: "/gol @Pedro",
    });
    strict_1.default.equal(goalCommand.ok, true);
    strict_1.default.equal(goalRepository.goals, 1);
}
