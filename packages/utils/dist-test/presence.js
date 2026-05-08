"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeIncomingMessage = normalizeIncomingMessage;
exports.parsePresenceResponse = parsePresenceResponse;
exports.buildPresenceMessage = buildPresenceMessage;
const YES_VALUES = new Set(["1", "sim", "vou", "confirmo"]);
const NO_VALUES = new Set(["2", "nao", "não"]);
function normalizeIncomingMessage(message) {
    return message
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}
function parsePresenceResponse(message) {
    const normalized = normalizeIncomingMessage(message);
    if (YES_VALUES.has(normalized)) {
        return "SIM";
    }
    if (NO_VALUES.has(normalized)) {
        return "NAO";
    }
    return null;
}
function buildPresenceMessage(input) {
    return [
        `Rachão ${input.turmaNome}`,
        `Confirme presença para jogo de ${input.dataJogo}.`,
        "Responda com:",
        "1 - Sim",
        "2 - Não",
    ].join("\n");
}
