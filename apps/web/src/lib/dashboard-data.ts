import type {
  DashboardData,
  FinanceiroResumo,
  GoalSummary,
  JogoSummary,
  PagamentoSummary,
  PresencaSummary,
  TimeSummary,
  TurmaSummary,
} from "@rachao/types";
import { computeDashboard } from "@/lib/store";

export async function getDashboardData(): Promise<DashboardData> {
  if (!process.env.DATABASE_URL) {
    return computeDashboard();
  }

  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session) return computeDashboard();

  const { db } = await import("@/lib/prisma");
  const turmaId = session.user.activeTeamId;

  const [turmas, jogadores, jogos, presencas, times, pagamentos, gols] = await Promise.all([
    db.turma.findMany({
      where: { memberships: { some: { userId: session.user.id } } },
    }),
    db.jogador.findMany({
      where: { turmaId },
      orderBy: { nome: "asc" },
    }),
    db.jogo.findMany({
      where: { turmaId },
      include: { presencas: true, turma: true },
      orderBy: { dataJogo: "desc" },
    }),
    db.presenca.findMany({
      where: { jogo: { turmaId } },
      include: { jogador: true, jogo: { include: { turma: true } }, time: true },
    }),
    db.time.findMany({
      where: { jogo: { turmaId } },
      include: { presencas: { include: { jogador: true } } },
    }),
    db.pagamento.findMany({
      where: { turmaId },
      include: { jogador: true },
      orderBy: [{ referenciaAno: "desc" }, { referenciaMes: "desc" }],
    }),
    db.gol.findMany({
      where: { jogo: { turmaId } },
      include: { jogador: true, assistencia: true, jogo: { include: { turma: true } } },
    }),
  ]);

  const jogadoresByTurma = new Map<string, number>();
  for (const j of jogadores) {
    jogadoresByTurma.set(j.turmaId, (jogadoresByTurma.get(j.turmaId) ?? 0) + 1);
  }

  const turmasSummary: TurmaSummary[] = turmas.map((t) => ({
    id: t.id,
    nome: t.nome,
    local: t.local,
    diaSemana: t.diaSemana,
    horario: t.horario,
    mensalidade: Number(t.mensalidade),
    status: t.status,
    whatsappGroupId: t.whatsappGroupId ?? null,
    whatsappProvider: t.whatsappProvider ?? null,
    totalJogadores: jogadoresByTurma.get(t.id) ?? 0,
  }));

  const jogosSummary: JogoSummary[] = jogos.map((j) => ({
    id: j.id,
    turmaId: j.turmaId,
    turmaNome: j.turma.nome,
    dataJogo: j.dataJogo.toISOString().slice(0, 10),
    status: j.status,
    confirmados: j.presencas.filter((p) => p.resposta === "SIM" && p.posicaoFila === null).length,
    recusados: j.presencas.filter((p) => p.resposta === "NAO").length,
    pendentes: j.presencas.filter((p) => p.resposta === "PENDENTE").length,
    limitJogadores: j.limitJogadores ?? null,
    naFila: j.presencas.filter((p) => p.posicaoFila !== null && (p.posicaoFila ?? 0) > 0).length,
  }));

  const turmaMap = new Map(turmas.map((t) => [t.id, t.nome]));

  const presencasSummary: PresencaSummary[] = presencas.map((p) => ({
    id: p.id,
    jogoId: p.jogoId,
    jogadorId: p.jogadorId,
    jogadorNome: p.jogador.nome,
    turmaNome: p.jogo.turma.nome,
    resposta: p.resposta,
    timeNome: p.time?.nome ?? null,
    posicaoFila: p.posicaoFila ?? null,
  }));

  const timesSummary: TimeSummary[] = times.map((t) => ({
    id: t.id,
    jogoId: t.jogoId,
    turmaNome: turmaMap.get(jogos.find((j) => j.id === t.jogoId)?.turmaId ?? "") ?? "Turma",
    nome: t.nome,
    cor: t.cor ?? null,
    nivelMedio: Number(t.nivelMedio ?? 0),
    jogadores: t.presencas.map((p) => p.jogador.nome),
  }));

  const pagamentosSummary: PagamentoSummary[] = pagamentos.map((p) => ({
    id: p.id,
    turmaId: p.turmaId,
    jogadorId: p.jogadorId,
    jogadorNome: p.jogador.nome,
    referenciaMes: p.referenciaMes,
    referenciaAno: p.referenciaAno,
    valor: Number(p.valor),
    status: p.status,
    pagoEm: p.pagoEm?.toISOString() ?? null,
  }));

  const golsSummary: GoalSummary[] = gols.map((g) => ({
    id: g.id,
    jogoId: g.jogoId,
    jogadorId: g.jogadorId,
    jogadorNome: g.jogador.nome,
    turmaId: g.jogo.turmaId,
    turmaNome: g.jogo.turma.nome,
    assistenciaId: g.assistenciaId,
    assistenciaNome: g.assistencia?.nome ?? null,
    minuto: g.minuto,
    createdAt: g.createdAt.toISOString(),
  }));

  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();
  const doMes = pagamentosSummary.filter((p) => p.referenciaMes === mes && p.referenciaAno === ano);
  const recebidos = doMes.filter((p) => p.status === "PAGO").reduce((s, p) => s + p.valor, 0);
  const pendentes = doMes.filter((p) => p.status === "PENDENTE" || p.status === "ATRASADO").reduce((s, p) => s + p.valor, 0);

  const financeiro: FinanceiroResumo = {
    saldoMensal: Number((recebidos - pendentes).toFixed(2)),
    recebidosMes: Number(recebidos.toFixed(2)),
    pendentesMes: Number(pendentes.toFixed(2)),
    inadimplentes: doMes.filter((p) => p.status === "PENDENTE" || p.status === "ATRASADO"),
    pagamentos: pagamentosSummary,
  };

  const golsByPlayer = new Map<string, { jogadorId: string; jogadorNome: string; turmaId: string; turmaNome: string; total: number }>();
  for (const g of golsSummary) {
    const cur = golsByPlayer.get(g.jogadorId) ?? { jogadorId: g.jogadorId, jogadorNome: g.jogadorNome, turmaId: g.turmaId, turmaNome: g.turmaNome, total: 0 };
    cur.total++;
    golsByPlayer.set(g.jogadorId, cur);
  }

  const simByPlayer = new Map<string, { jogadorId: string; jogadorNome: string; turmaId: string; turmaNome: string; total: number }>();
  for (const p of presencasSummary.filter((p) => p.resposta === "SIM")) {
    const jog = jogadores.find((j) => j.id === p.jogadorId);
    if (!jog) continue;
    const cur = simByPlayer.get(p.jogadorId) ?? { jogadorId: p.jogadorId, jogadorNome: jog.nome, turmaId: jog.turmaId, turmaNome: turmaMap.get(jog.turmaId) ?? "Turma", total: 0 };
    cur.total++;
    simByPlayer.set(p.jogadorId, cur);
  }

  return {
    turmas: turmasSummary,
    jogadores: jogadores.map((j) => ({
      id: j.id,
      turmaId: j.turmaId,
      nome: j.nome,
      telefone: j.telefone,
      email: j.email,
      posicao: j.posicao,
      nivel: j.nivel,
      ativo: j.ativo,
    })),
    financeiro,
    jogos: jogosSummary,
    presencas: presencasSummary,
    timesGerados: timesSummary,
    estatisticas: {
      gols: golsSummary,
      artilharia: [...golsByPlayer.values()].sort((a, b) => b.total - a.total),
      presencaRanking: [...simByPlayer.values()].sort((a, b) => b.total - a.total),
    },
  };
}
