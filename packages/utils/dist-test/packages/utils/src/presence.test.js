"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const presence_1 = require("./presence");
strict_1.default.equal((0, presence_1.parsePresenceResponse)("1"), "SIM");
strict_1.default.equal((0, presence_1.parsePresenceResponse)("sim"), "SIM");
strict_1.default.equal((0, presence_1.parsePresenceResponse)("vou"), "SIM");
strict_1.default.equal((0, presence_1.parsePresenceResponse)("confirmo"), "SIM");
strict_1.default.equal((0, presence_1.parsePresenceResponse)("2"), "NAO");
strict_1.default.equal((0, presence_1.parsePresenceResponse)("não"), "NAO");
strict_1.default.equal((0, presence_1.parsePresenceResponse)("nao"), "NAO");
strict_1.default.equal((0, presence_1.parsePresenceResponse)("talvez"), null);
strict_1.default.match((0, presence_1.buildPresenceMessage)({ turmaNome: "Quarta", dataJogo: "2026-05-14" }), /1 - Sim/);
strict_1.default.deepEqual((0, presence_1.parseGoalCommand)("/gol @Leo"), {
    command: "/gol",
    playerName: "Leo",
    normalizedPlayerName: "leo",
});
strict_1.default.deepEqual((0, presence_1.parseGoalCommand)("/gol João Pedro"), {
    command: "/gol",
    playerName: "João Pedro",
    normalizedPlayerName: "joao pedro",
});
strict_1.default.equal((0, presence_1.parseGoalCommand)("/gol"), null);
console.log("presence parser tests passed");
