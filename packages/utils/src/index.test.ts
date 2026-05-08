import assert from "node:assert/strict";
import {
  buildPresenceMessage,
  buildReminderMessage,
  formatCurrency,
  getMinuteKey,
  groupPlayersByPosition,
  matchesCron,
  normalizePhone,
  parseGoalCommand,
  sortPlayersByLevel,
} from "./index";

const sorted = sortPlayersByLevel([
  { id: "1", turmaId: "t1", nome: "B", telefone: "1", posicao: "ALA", nivel: 2, ativo: true },
  { id: "2", turmaId: "t1", nome: "A", telefone: "2", posicao: "FIXO", nivel: 5, ativo: true },
]);

assert.equal(sorted[0]?.nome, "A");
assert.equal(sorted[1]?.nome, "B");

const grouped = groupPlayersByPosition([
  { id: "1", turmaId: "t1", nome: "A", telefone: "1", posicao: "ALA", nivel: 2, ativo: true },
  { id: "2", turmaId: "t1", nome: "B", telefone: "2", posicao: "ALA", nivel: 5, ativo: true },
]);

assert.equal(grouped.ALA?.length, 2);
assert.equal(normalizePhone("(11) 99999-1234"), "11999991234");
assert.match(formatCurrency(80), /80/);
assert.equal(matchesCron("0 20 * * 0", new Date("2026-05-10T20:00:00")), true);
assert.equal(getMinuteKey(new Date("2026-05-10T20:00:00")), "2026-5-10-20-0");
assert.equal(parseGoalCommand("/gol @Leo")?.normalizedPlayerName, "leo");
assert.match(buildPresenceMessage({ turmaNome: "Quarta", dataJogo: "2026-05-14" }), /Confirmacao aberta/);
assert.match(buildReminderMessage({ turmaNome: "Quarta", pendingPlayers: ["Leo"] }), /Leo/);

console.log("utils tests passed");
