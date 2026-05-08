"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runJogadorServiceTests = runJogadorServiceTests;
const strict_1 = __importDefault(require("node:assert/strict"));
const jogador_service_1 = require("./jogador.service");
class InMemoryJogadorRepository {
    items = [];
    async list() {
        return this.items;
    }
    async create(input) {
        const jogador = {
            id: "j1",
            turmaId: input.turmaId,
            nome: input.nome,
            telefone: input.telefone,
            email: input.email ?? null,
            posicao: input.posicao,
            nivel: input.nivel,
            ativo: true,
        };
        this.items.push(jogador);
        return jogador;
    }
}
async function runJogadorServiceTests() {
    const service = new jogador_service_1.JogadorService(new InMemoryJogadorRepository());
    const created = await service.create({
        turmaId: "t1",
        nome: "Pedro",
        telefone: "11999991234",
        posicao: "ALA",
        nivel: 4,
    });
    strict_1.default.equal(created.nome, "Pedro");
    strict_1.default.equal(created.posicao, "ALA");
}
