import type { DashboardData, JogoSummary, RankingEntry, TimeSummary } from "@rachao/types";

export function getActiveTurmaName(data: DashboardData) {
  return data.turmas[0]?.nome ?? "Turma piloto";
}

export function getHomeStats(data: DashboardData) {
  const nextGame = data.jogos[0];
  const topScorer = data.estatisticas.artilharia[0];

  return {
    nextGameLabel: nextGame ? nextGame.turmaNome : "Sem jogo marcado",
    confirmed: data.presencas.filter((item) => item.resposta === "SIM").length,
    pending: data.presencas.filter((item) => item.resposta === "PENDENTE").length,
    debtors: data.financeiro.inadimplentes.length,
    balance: data.financeiro.saldoMensal,
    topScorer: topScorer?.jogadorNome ?? "Sem gols",
  };
}

export function getWeeklyTimeline(data: DashboardData) {
  const nextGame = data.jogos[0];

  return [
    {
      title: "Domingo 20h",
      description: "Disparo automatico de confirmacao",
      status: "Pronto",
    },
    {
      title: "Terca 18h",
      description: "Lembrete para pendentes",
      status: `${data.presencas.filter((item) => item.resposta === "PENDENTE").length} pendentes`,
    },
    {
      title: "Quarta 10h",
      description: nextGame ? "Fechamento de lista" : "Sem jogo programado",
      status: nextGame?.status ?? "Aguardando",
    },
    {
      title: "Quarta 10h01",
      description: "Geracao de times",
      status: data.timesGerados.length > 0 ? "Times prontos" : "Aguardando",
    },
  ];
}

export function splitMatches(data: DashboardData) {
  const upcoming = data.jogos.filter((item) =>
    ["RASCUNHO", "CONFIRMACAO_ABERTA", "FECHADO", "TIMES_GERADOS"].includes(item.status)
  );
  const previous = data.jogos.filter((item) => item.status === "FINALIZADO");
  return { upcoming, previous };
}

export function getTopPresence(data: DashboardData) {
  return data.estatisticas.presencaRanking.slice(0, 5);
}

export function getTopScorers(data: DashboardData) {
  return data.estatisticas.artilharia.slice(0, 5);
}

export function getDifferenceBetweenTeams(teams: TimeSummary[]) {
  if (teams.length < 2) return 0;
  const values = teams.map((item) => item.nivelMedio);
  return Math.max(...values) - Math.min(...values);
}

export function getOrganizerAlerts(data: DashboardData) {
  const items: string[] = [];
  if (data.financeiro.inadimplentes.length > 0) {
    items.push(`${data.financeiro.inadimplentes.length} inadimplentes precisam de cobranca.`);
  }
  if (data.presencas.some((item) => item.resposta === "PENDENTE")) {
    items.push("Ainda ha jogadores sem resposta para o proximo jogo.");
  }
  if (data.timesGerados.length === 0) {
    items.push("Nenhum sorteio salvo para o jogo atual.");
  }
  return items;
}

export function getQuickRanking(data: DashboardData): RankingEntry[] {
  return data.estatisticas.artilharia.slice(0, 3);
}

export function getLatestResponses(data: DashboardData) {
  return data.presencas.slice(0, 6);
}

export function getTeamColumns(data: DashboardData) {
  const colors = ["Vermelho", "Azul", "Verde", "Branco"];
  const playerByName = new Map(
    data.jogadores.map((player) => [player.nome, { nome: player.nome, posicao: player.posicao, nivel: player.nivel }])
  );
  return data.timesGerados.map((team, index) => ({
    ...team,
    label: colors[index] ? `Time ${colors[index]}` : team.nome,
    playersDetailed: team.jogadores.map((name) => playerByName.get(name) ?? { nome: name, posicao: "CORINGA", nivel: 0 }),
  }));
}

export function getPresenceBuckets(data: DashboardData) {
  return {
    confirmed: data.presencas.filter((item) => item.resposta === "SIM"),
    refused: data.presencas.filter((item) => item.resposta === "NAO"),
    pending: data.presencas.filter((item) => item.resposta === "PENDENTE"),
  };
}

export function getRecentGoals(data: DashboardData): Array<{ title: string; subtitle: string }> {
  return data.estatisticas.gols.slice(0, 5).map((item) => ({
    title: item.jogadorNome,
    subtitle: `${item.turmaNome} • minuto ${item.minuto ?? "-"}`,
  }));
}

export function getTurmaNameMap(data: DashboardData) {
  return new Map(data.turmas.map((item) => [item.id, item.nome]));
}

export function getEmptyMatchesPlaceholder(): JogoSummary[] {
  return [];
}
