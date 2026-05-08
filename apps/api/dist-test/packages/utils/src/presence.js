"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeIncomingMessage = normalizeIncomingMessage;
exports.parsePresenceResponse = parsePresenceResponse;
exports.parseGoalCommand = parseGoalCommand;
exports.buildPresenceMessage = buildPresenceMessage;
exports.buildReminderMessage = buildReminderMessage;
exports.buildListClosedMessage = buildListClosedMessage;
exports.buildTeamsGeneratedMessage = buildTeamsGeneratedMessage;
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
function parseGoalCommand(message) {
    const normalized = message.trim();
    const match = normalized.match(/^\/gol\s+@?(.+)$/i);
    if (!match?.[1]) {
        return null;
    }
    const playerName = match[1].trim().replace(/^@/, "");
    if (!playerName) {
        return null;
    }
    return {
        command: "/gol",
        playerName,
        normalizedPlayerName: normalizeIncomingMessage(playerName),
    };
}
function buildPresenceMessage(input) {
    return [
        `Rachao ${input.turmaNome}`,
        "",
        `Confirmacao aberta para jogo de ${input.dataJogo}.`,
        "Responda ate quarta 10h para entrar no sorteio.",
        "",
        "Como responder:",
        "1 - Sim, vou jogar",
        "2 - Nao vou",
        "",
        "Comandos do grupo:",
        "/times para refazer sorteio",
        "/gol @nome para registrar gol",
        "",
        "Valeu. Bora organizar bonito.",
    ].join("\n");
}
function buildReminderMessage(input) {
    return [
        `Rachao ${input.turmaNome}`,
        "",
        "Lembrete de confirmacao.",
        `Ainda sem resposta: ${input.pendingPlayers.join(", ")}.`,
        "",
        "Responda com:",
        "1 - Sim",
        "2 - Nao",
    ].join("\n");
}
function buildListClosedMessage(input) {
    return [
        `Rachao ${input.turmaNome}`,
        "",
        "Lista fechada.",
        `Confirmados: ${input.confirmedCount}.`,
        "Sorteio dos times saindo em seguida.",
    ].join("\n");
}
function buildTeamsGeneratedMessage(input) {
    return [
        `Rachao ${input.turmaNome}`,
        "",
        "Times gerados.",
        ...input.teams.flatMap((team) => [
            "",
            `${team.nome}:`,
            ...team.jogadores.map((player) => `- ${player.nome}`),
        ]),
    ].join("\n");
}
