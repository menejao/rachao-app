"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const team_balance_1 = require("./team-balance");
const players = [
    { id: "1", nome: "G1", posicao: "GOLEIRO", nivel: 5 },
    { id: "2", nome: "G2", posicao: "GOLEIRO", nivel: 4 },
    { id: "3", nome: "F1", posicao: "FIXO", nivel: 5 },
    { id: "4", nome: "F2", posicao: "FIXO", nivel: 4 },
    { id: "5", nome: "A1", posicao: "ALA", nivel: 5 },
    { id: "6", nome: "A2", posicao: "ALA", nivel: 4 },
    { id: "7", nome: "P1", posicao: "PIVO", nivel: 3 },
    { id: "8", nome: "P2", posicao: "PIVO", nivel: 2 },
];
const twoTeams = (0, team_balance_1.generateBalancedTeams)([...players], 2);
strict_1.default.equal(twoTeams.length, 2);
strict_1.default.equal(twoTeams[0]?.jogadores.filter((p) => p.posicao === "GOLEIRO").length, 1);
strict_1.default.equal(twoTeams[1]?.jogadores.filter((p) => p.posicao === "GOLEIRO").length, 1);
const manyPlayers = Array.from({ length: 18 }, (_, index) => ({
    id: String(index + 1),
    nome: `Jogador ${index + 1}`,
    posicao: index < 3 ? "GOLEIRO" : index % 4 === 0 ? "FIXO" : index % 4 === 1 ? "ALA" : index % 4 === 2 ? "PIVO" : "CORINGA",
    nivel: 5 - (index % 5),
}));
const threeTeams = (0, team_balance_1.generateBalancedTeams)(manyPlayers);
strict_1.default.equal(threeTeams.length, 3);
strict_1.default.ok(threeTeams.every((team) => team.jogadores.length >= 5));
console.log("team balance tests passed");
