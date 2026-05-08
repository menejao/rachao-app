import type { RespostaPresenca } from "@rachao/types";

const YES_VALUES = new Set(["1", "sim", "vou", "confirmo"]);
const NO_VALUES = new Set(["2", "nao", "não"]);

export function normalizeIncomingMessage(message: string) {
  return message
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function parsePresenceResponse(message: string): RespostaPresenca | null {
  const normalized = normalizeIncomingMessage(message);

  if (YES_VALUES.has(normalized)) {
    return "SIM";
  }

  if (NO_VALUES.has(normalized)) {
    return "NAO";
  }

  return null;
}

export function parseGoalCommand(message: string) {
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
    command: "/gol" as const,
    playerName,
    normalizedPlayerName: normalizeIncomingMessage(playerName),
  };
}

export function buildPresenceMessage(input: { turmaNome: string; dataJogo: string }) {
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

export function buildReminderMessage(input: { turmaNome: string; pendingPlayers: string[] }) {
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

export function buildListClosedMessage(input: { turmaNome: string; confirmedCount: number }) {
  return [
    `Rachao ${input.turmaNome}`,
    "",
    "Lista fechada.",
    `Confirmados: ${input.confirmedCount}.`,
    "Sorteio dos times saindo em seguida.",
  ].join("\n");
}

export function buildTeamsGeneratedMessage(input: {
  turmaNome: string;
  teams: Array<{ nome: string; jogadores: Array<{ nome: string }> }>;
}) {
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
