import assert from "node:assert/strict";
import { buildPresenceMessage, parseGoalCommand, parsePresenceResponse } from "./presence";

assert.equal(parsePresenceResponse("1"), "SIM");
assert.equal(parsePresenceResponse("sim"), "SIM");
assert.equal(parsePresenceResponse("vou"), "SIM");
assert.equal(parsePresenceResponse("confirmo"), "SIM");
assert.equal(parsePresenceResponse("2"), "NAO");
assert.equal(parsePresenceResponse("não"), "NAO");
assert.equal(parsePresenceResponse("nao"), "NAO");
assert.equal(parsePresenceResponse("talvez"), null);
assert.match(buildPresenceMessage({ turmaNome: "Quarta", dataJogo: "2026-05-14" }), /1 - Sim/);

assert.deepEqual(parseGoalCommand("/gol @Leo"), {
  command: "/gol",
  playerName: "Leo",
  normalizedPlayerName: "leo",
});
assert.deepEqual(parseGoalCommand("/gol João Pedro"), {
  command: "/gol",
  playerName: "João Pedro",
  normalizedPlayerName: "joao pedro",
});
assert.equal(parseGoalCommand("/gol"), null);

console.log("presence parser tests passed");
