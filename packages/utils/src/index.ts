import type { JogadorSummary } from "@rachao/types";

export function sortPlayersByLevel(players: JogadorSummary[]) {
  return [...players].sort((left, right) => right.nivel - left.nivel);
}

export function groupPlayersByPosition(players: JogadorSummary[]) {
  return players.reduce<Record<string, JogadorSummary[]>>((acc, player) => {
    const key = player.posicao;
    acc[key] ??= [];
    acc[key].push(player);
    return acc;
  }, {});
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function normalizeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export * from "./presence";
export * from "./team-balance";
export * from "./cron";
