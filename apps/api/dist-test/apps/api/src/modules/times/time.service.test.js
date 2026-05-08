"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTimeServiceTests = runTimeServiceTests;
const strict_1 = __importDefault(require("node:assert/strict"));
const time_service_1 = require("./time.service");
class InMemoryLogRepository {
    async create() { }
    async list() {
        return [];
    }
}
class InMemoryTimeRepository {
    async getConfirmedPlayers() {
        return {
            jogoId: "g1",
            turmaId: "t1",
            jogadores: [
                { id: "1", nome: "G1", posicao: "GOLEIRO", nivel: 5 },
                { id: "2", nome: "G2", posicao: "GOLEIRO", nivel: 4 },
                { id: "3", nome: "A1", posicao: "ALA", nivel: 5 },
                { id: "4", nome: "A2", posicao: "ALA", nivel: 4 },
                { id: "5", nome: "F1", posicao: "FIXO", nivel: 3 },
                { id: "6", nome: "P1", posicao: "PIVO", nivel: 2 },
            ],
        };
    }
    async replaceTeams(_jogoId, teams) {
        return teams.map((team, index) => ({
            id: `time-${index + 1}`,
            nome: team.nome,
            cor: team.cor,
            nivelMedio: team.nivelMedio,
            jogadores: team.jogadores,
        }));
    }
}
async function runTimeServiceTests() {
    const service = new time_service_1.TimeService(new InMemoryTimeRepository(), new InMemoryLogRepository());
    const result = await service.generate("g1", 2);
    strict_1.default.equal(result.length, 2);
    strict_1.default.equal(result[0]?.jogadores.length, 3);
    strict_1.default.equal(result[1]?.jogadores.length, 3);
}
