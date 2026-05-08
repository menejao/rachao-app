import type { GeneratedTeam, Posicao, TeamDraftPlayer } from "@rachao/types";

const TEAM_NAMES = [
  "Time Azul",
  "Time Laranja",
  "Time Verde",
  "Time Preto",
  "Time Branco",
  "Time Vermelho",
];

const TEAM_COLORS = ["azul", "laranja", "verde", "preto", "branco", "vermelho"];
const POSITION_PRIORITY: Posicao[] = ["GOLEIRO", "FIXO", "ALA", "PIVO", "CORINGA"];

interface WorkingTeam {
  nome: string;
  cor: string;
  jogadores: TeamDraftPlayer[];
  totalNivel: number;
}

function inferTeamCount(playerCount: number) {
  if (playerCount >= 18) return 3;
  if (playerCount >= 28) return 4;
  return 2;
}

function teamAverage(team: WorkingTeam) {
  return team.jogadores.length ? team.totalNivel / team.jogadores.length : 0;
}

function countPosition(team: WorkingTeam, posicao: Posicao) {
  return team.jogadores.filter((item) => item.posicao === posicao).length;
}

function pickBestTeam(teams: WorkingTeam[], player: TeamDraftPlayer) {
  const sorted = [...teams].sort((left, right) => {
    const goalieDiff = countPosition(left, "GOLEIRO") - countPosition(right, "GOLEIRO");
    if (player.posicao === "GOLEIRO" && goalieDiff !== 0) {
      return goalieDiff;
    }

    const samePositionDiff = countPosition(left, player.posicao) - countPosition(right, player.posicao);
    if (samePositionDiff !== 0) {
      return samePositionDiff;
    }

    const sizeDiff = left.jogadores.length - right.jogadores.length;
    if (sizeDiff !== 0) {
      return sizeDiff;
    }

    return teamAverage(left) - teamAverage(right);
  });

  return sorted[0]!;
}

export function generateBalancedTeams(
  players: TeamDraftPlayer[],
  requestedTeamCount?: number
): GeneratedTeam[] {
  if (players.length < 2) {
    throw new Error("Jogadores insuficientes para gerar times");
  }

  const teamCount = Math.max(2, requestedTeamCount ?? inferTeamCount(players.length));
  const teams: WorkingTeam[] = Array.from({ length: teamCount }, (_, index) => ({
    nome: TEAM_NAMES[index] ?? `Time ${index + 1}`,
    cor: TEAM_COLORS[index] ?? `cor-${index + 1}`,
    jogadores: [],
    totalNivel: 0,
  }));

  const byPriority = POSITION_PRIORITY.flatMap((posicao) =>
    players
      .filter((player) => player.posicao === posicao)
      .sort((left, right) => right.nivel - left.nivel)
  );

  for (const player of byPriority) {
    const team = pickBestTeam(teams, player);
    team.jogadores.push(player);
    team.totalNivel += player.nivel;
  }

  return teams
    .filter((team) => team.jogadores.length > 0)
    .map((team) => ({
      nome: team.nome,
      cor: team.cor,
      nivelMedio: Number((team.totalNivel / team.jogadores.length).toFixed(2)),
      jogadores: [...team.jogadores].sort((left, right) => right.nivel - left.nivel),
    }));
}
