"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTurmaServiceTests = runTurmaServiceTests;
const strict_1 = __importDefault(require("node:assert/strict"));
const turma_service_1 = require("./turma.service");
class InMemoryTurmaRepository {
    items = [];
    async list() {
        return this.items;
    }
    async create(input) {
        const turma = {
            id: "t1",
            nome: input.nome,
            local: input.local ?? null,
            diaSemana: input.diaSemana,
            horario: input.horario,
            mensalidade: input.mensalidade,
            status: "ATIVA",
            totalJogadores: 0,
        };
        this.items.push(turma);
        return turma;
    }
}
async function runTurmaServiceTests() {
    const service = new turma_service_1.TurmaService(new InMemoryTurmaRepository());
    const created = await service.create({
        nome: "Quarta 20h",
        local: "Arena",
        diaSemana: 3,
        horario: "20:00",
        mensalidade: 80,
        organizadorId: "org1",
    });
    strict_1.default.equal(created.nome, "Quarta 20h");
    strict_1.default.equal(created.mensalidade, 80);
}
