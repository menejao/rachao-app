import assert from "node:assert/strict";
import { generateBalancedTeams } from "./team-balance";

const players = [
  { id: "1", nome: "G1", posicao: "GOLEIRO", nivel: 5 },
  { id: "2", nome: "G2", posicao: "GOLEIRO", nivel: 4 },
  { id: "3", nome: "F1", posicao: "FIXO", nivel: 5 },
  { id: "4", nome: "F2", posicao: "FIXO", nivel: 4 },
  { id: "5", nome: "A1", posicao: "ALA", nivel: 5 },
  { id: "6", nome: "A2", posicao: "ALA", nivel: 4 },
  { id: "7", nome: "P1", posicao: "PIVO", nivel: 3 },
  { id: "8", nome: "P2", posicao: "PIVO", nivel: 2 },
] as const;

const twoTeams = generateBalancedTeams([...players], 2);
assert.equal(twoTeams.length, 2);
assert.equal(twoTeams[0]?.jogadores.filter((p) => p.posicao === "GOLEIRO").length, 1);
assert.equal(twoTeams[1]?.jogadores.filter((p) => p.posicao === "GOLEIRO").length, 1);

const manyPlayers = Array.from({ length: 18 }, (_, index) => ({
  id: String(index + 1),
  nome: `Jogador ${index + 1}`,
  posicao: index < 3 ? "GOLEIRO" : index % 4 === 0 ? "FIXO" : index % 4 === 1 ? "ALA" : index % 4 === 2 ? "PIVO" : "CORINGA",
  nivel: 5 - (index % 5),
})) as Array<{ id: string; nome: string; posicao: "GOLEIRO" | "FIXO" | "ALA" | "PIVO" | "CORINGA"; nivel: number }>;

const threeTeams = generateBalancedTeams(manyPlayers);
assert.equal(threeTeams.length, 3);
assert.ok(threeTeams.every((team) => team.jogadores.length >= 5));

console.log("team balance tests passed");
