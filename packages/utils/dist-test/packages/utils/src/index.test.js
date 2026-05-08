"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const index_1 = require("./index");
const sorted = (0, index_1.sortPlayersByLevel)([
    { id: "1", turmaId: "t1", nome: "B", telefone: "1", posicao: "ALA", nivel: 2, ativo: true },
    { id: "2", turmaId: "t1", nome: "A", telefone: "2", posicao: "FIXO", nivel: 5, ativo: true },
]);
strict_1.default.equal(sorted[0]?.nome, "A");
strict_1.default.equal(sorted[1]?.nome, "B");
const grouped = (0, index_1.groupPlayersByPosition)([
    { id: "1", turmaId: "t1", nome: "A", telefone: "1", posicao: "ALA", nivel: 2, ativo: true },
    { id: "2", turmaId: "t1", nome: "B", telefone: "2", posicao: "ALA", nivel: 5, ativo: true },
]);
strict_1.default.equal(grouped.ALA?.length, 2);
strict_1.default.equal((0, index_1.normalizePhone)("(11) 99999-1234"), "11999991234");
strict_1.default.match((0, index_1.formatCurrency)(80), /80/);
strict_1.default.equal((0, index_1.matchesCron)("0 20 * * 0", new Date("2026-05-10T20:00:00")), true);
strict_1.default.equal((0, index_1.getMinuteKey)(new Date("2026-05-10T20:00:00")), "2026-5-10-20-0");
strict_1.default.equal((0, index_1.parseGoalCommand)("/gol @Leo")?.normalizedPlayerName, "leo");
strict_1.default.match((0, index_1.buildPresenceMessage)({ turmaNome: "Quarta", dataJogo: "2026-05-14" }), /Confirmacao aberta/);
strict_1.default.match((0, index_1.buildReminderMessage)({ turmaNome: "Quarta", pendingPlayers: ["Leo"] }), /Leo/);
console.log("utils tests passed");
