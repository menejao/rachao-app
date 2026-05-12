import type {
  DashboardData,
  FinanceiroResumo,
  GoalSummary,
  JogadorSummary,
  JogoSummary,
  PagamentoSummary,
  PresencaSummary,
  RespostaPresenca,
  TimeSummary,
  TurmaSummary,
} from "@rachao/types";
import { generateBalancedTeams, normalizePhone } from "@rachao/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  role: "ADMIN" | "PLAYER";
  activeTeamId: string;
}

export interface DemoMembership {
  userId: string;
  turmaId: string;
  role: "ADMIN" | "PLAYER";
}

export interface DemoInvite {
  id: string;
  token: string;
  turmaId: string;
  turmaNome: string;
  role: "ADMIN" | "PLAYER";
  expiresAt: string;
  usedAt: string | null;
}

interface DemoPresence {
  id: string;
  jogoId: string;
  jogadorId: string;
  resposta: RespostaPresenca;
  timeId: string | null;
}

interface DemoGame {
  id: string;
  turmaId: string;
  dataJogo: string;
  status: "RASCUNHO" | "CONFIRMACAO_ABERTA" | "FECHADO" | "TIMES_GERADOS" | "FINALIZADO";
}

interface DemoTeam {
  id: string;
  jogoId: string;
  nome: string;
  cor?: string;
  nivelMedio: number;
  jogadores: Array<{ id: string; nome: string; posicao: string; nivel: number }>;
}

// ─── Store ───────────────────────────────────────────────────────────────────

const store: {
  turmas: Array<TurmaSummary>;
  jogadores: JogadorSummary[];
  jogos: DemoGame[];
  presencas: DemoPresence[];
  times: DemoTeam[];
  gols: GoalSummary[];
  pagamentos: PagamentoSummary[];
  users: DemoUser[];
  memberships: DemoMembership[];
  invites: DemoInvite[];
} = {
  turmas: [
    {
      id: "turma-demo-1",
      nome: "Racha Quarta",
      local: "Arena Vila",
      diaSemana: 3,
      horario: "20:00",
      mensalidade: 80,
      status: "ATIVA",
      totalJogadores: 10,
      whatsappGroupId: "grupo-quadra",
      whatsappStatus: "CONECTADO" as const,
      whatsappActivationCode: "RACHAO-DEMO",
      whatsappConnectedAt: "2026-05-01T20:00:00.000Z",
      whatsappLastActivity: "2026-05-14T20:30:00.000Z",
      whatsappGroupName: "Racha Quarta 🏟️",
      autoConfirmacaoHoras: 48,
      autoLembreteHoras: 24,
      autoFechamentoHoras: 2,
      autoTimesHoras: 1,
      cobrancaDiaVencimento: 10,
      cobrancaLembreteDiasAntes: 3,
      cobrancaLembreteDia: true,
      cobrancaLembreteApos: 3,
      pixKey: null,
      mensagemCobranca: null,
    },
  ],
  jogadores: [
    { id: "j1", turmaId: "turma-demo-1", nome: "Leo",   telefone: "5511999991001", posicao: "GOLEIRO", nivel: 5, ativo: true },
    { id: "j2", turmaId: "turma-demo-1", nome: "Beto",  telefone: "5511999991002", posicao: "GOLEIRO", nivel: 4, ativo: true },
    { id: "j3", turmaId: "turma-demo-1", nome: "Rafa",  telefone: "5511999991003", posicao: "FIXO",    nivel: 5, ativo: true },
    { id: "j4", turmaId: "turma-demo-1", nome: "Iago",  telefone: "5511999991004", posicao: "FIXO",    nivel: 3, ativo: true },
    { id: "j5", turmaId: "turma-demo-1", nome: "Nando", telefone: "5511999991005", posicao: "ALA",     nivel: 5, ativo: true },
    { id: "j6", turmaId: "turma-demo-1", nome: "Gui",   telefone: "5511999991006", posicao: "ALA",     nivel: 4, ativo: true },
    { id: "j7", turmaId: "turma-demo-1", nome: "Digo",  telefone: "5511999991007", posicao: "ALA",     nivel: 3, ativo: true },
    { id: "j8", turmaId: "turma-demo-1", nome: "Pablo", telefone: "5511999991008", posicao: "PIVO",    nivel: 4, ativo: true },
    { id: "j9", turmaId: "turma-demo-1", nome: "Cadu",  telefone: "5511999991009", posicao: "PIVO",    nivel: 2, ativo: true },
    { id: "j10", turmaId: "turma-demo-1", nome: "Teo",  telefone: "5511999991010", posicao: "CORINGA", nivel: 4, ativo: true },
  ],
  jogos: [
    { id: "g-demo-1", turmaId: "turma-demo-1", dataJogo: "2026-05-14", status: "CONFIRMACAO_ABERTA" },
  ],
  presencas: [
    { id: "p1",  jogoId: "g-demo-1", jogadorId: "j1",  resposta: "SIM",     timeId: null },
    { id: "p2",  jogoId: "g-demo-1", jogadorId: "j2",  resposta: "SIM",     timeId: null },
    { id: "p3",  jogoId: "g-demo-1", jogadorId: "j3",  resposta: "SIM",     timeId: null },
    { id: "p4",  jogoId: "g-demo-1", jogadorId: "j4",  resposta: "SIM",     timeId: null },
    { id: "p5",  jogoId: "g-demo-1", jogadorId: "j5",  resposta: "SIM",     timeId: null },
    { id: "p6",  jogoId: "g-demo-1", jogadorId: "j6",  resposta: "SIM",     timeId: null },
    { id: "p7",  jogoId: "g-demo-1", jogadorId: "j7",  resposta: "NAO",     timeId: null },
    { id: "p8",  jogoId: "g-demo-1", jogadorId: "j8",  resposta: "SIM",     timeId: null },
    { id: "p9",  jogoId: "g-demo-1", jogadorId: "j9",  resposta: "SIM",     timeId: null },
    { id: "p10", jogoId: "g-demo-1", jogadorId: "j10", resposta: "PENDENTE", timeId: null },
  ],
  times: [],
  gols: [
    { id: "gol-1", jogoId: "g-demo-1", jogadorId: "j5", jogadorNome: "Nando", turmaId: "turma-demo-1", turmaNome: "Racha Quarta", assistenciaId: null, assistenciaNome: null, minuto: 12, createdAt: "2026-05-14T20:30:00.000Z" },
    { id: "gol-2", jogoId: "g-demo-1", jogadorId: "j3", jogadorNome: "Rafa",  turmaId: "turma-demo-1", turmaNome: "Racha Quarta", assistenciaId: null, assistenciaNome: null, minuto: 18, createdAt: "2026-05-14T20:36:00.000Z" },
    { id: "gol-3", jogoId: "g-demo-1", jogadorId: "j5", jogadorNome: "Nando", turmaId: "turma-demo-1", turmaNome: "Racha Quarta", assistenciaId: null, assistenciaNome: null, minuto: 27, createdAt: "2026-05-14T20:45:00.000Z" },
  ],
  pagamentos: [
    { id: "pg1", turmaId: "turma-demo-1", jogadorId: "j1", jogadorNome: "Leo",  referenciaMes: 5, referenciaAno: 2026, valor: 80, status: "PAGO",     pagoEm: "2026-05-02T12:00:00.000Z" },
    { id: "pg2", turmaId: "turma-demo-1", jogadorId: "j2", jogadorNome: "Beto", referenciaMes: 5, referenciaAno: 2026, valor: 80, status: "ATRASADO", pagoEm: null },
    { id: "pg3", turmaId: "turma-demo-1", jogadorId: "j3", jogadorNome: "Rafa", referenciaMes: 5, referenciaAno: 2026, valor: 80, status: "PENDENTE", pagoEm: null },
  ],
  users: [
    { id: "user-admin", name: "Joao (Admin)", email: "admin@rachao.com", password: "123456", phone: null, role: "ADMIN", activeTeamId: "turma-demo-1" },
    { id: "user-player", name: "Leo (Jogador)", email: "jogador@rachao.com", password: "123456", phone: null, role: "PLAYER", activeTeamId: "turma-demo-1" },
  ],
  memberships: [
    { userId: "user-admin", turmaId: "turma-demo-1", role: "ADMIN" },
    { userId: "user-player", turmaId: "turma-demo-1", role: "PLAYER" },
  ],
  invites: [],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(prefix: string, list: { id: string }[]) {
  return `${prefix}-${list.length + 1}-${Date.now()}`;
}

function jogosAsSummary(): JogoSummary[] {
  return store.jogos.map((jogo) => {
    const turma = store.turmas.find((t) => t.id === jogo.turmaId);
    const ps = store.presencas.filter((p) => p.jogoId === jogo.id);
    return {
      id: jogo.id,
      turmaId: jogo.turmaId,
      turmaNome: turma?.nome ?? "Turma",
      dataJogo: jogo.dataJogo,
      status: jogo.status,
      confirmados: ps.filter((p) => p.resposta === "SIM").length,
      recusados:   ps.filter((p) => p.resposta === "NAO").length,
      pendentes:   ps.filter((p) => p.resposta === "PENDENTE").length,
    };
  });
}

function presencasAsSummary(): PresencaSummary[] {
  return store.presencas.map((p) => {
    const jogador = store.jogadores.find((j) => j.id === p.jogadorId);
    const jogo    = store.jogos.find((j) => j.id === p.jogoId);
    const turma   = store.turmas.find((t) => t.id === jogo?.turmaId);
    const time    = store.times.find((t) => t.id === p.timeId);
    return {
      id: p.id,
      jogoId: p.jogoId,
      jogadorId: p.jogadorId,
      jogadorNome: jogador?.nome ?? "Jogador",
      turmaNome:   turma?.nome ?? "Turma",
      resposta: p.resposta,
      timeNome: time?.nome ?? null,
    };
  });
}

function timesAsSummary(): TimeSummary[] {
  return store.times.map((t) => {
    const jogo  = store.jogos.find((j) => j.id === t.jogoId);
    const turma = store.turmas.find((tu) => tu.id === jogo?.turmaId);
    return {
      id: t.id,
      jogoId: t.jogoId,
      turmaNome: turma?.nome ?? "Turma",
      nome: t.nome,
      cor: t.cor ?? null,
      nivelMedio: t.nivelMedio,
      jogadores: t.jogadores.map((j) => j.nome),
    };
  });
}

function financeiroResumo(): FinanceiroResumo {
  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();
  const doMes = store.pagamentos.filter((p) => p.referenciaMes === mes && p.referenciaAno === ano);
  const recebidos  = doMes.filter((p) => p.status === "PAGO").reduce((s, p) => s + p.valor, 0);
  const pendentes  = doMes.filter((p) => p.status === "PENDENTE" || p.status === "ATRASADO").reduce((s, p) => s + p.valor, 0);
  return {
    saldoMensal: Number((recebidos - pendentes).toFixed(2)),
    recebidosMes: Number(recebidos.toFixed(2)),
    pendentesMes: Number(pendentes.toFixed(2)),
    inadimplentes: doMes.filter((p) => p.status === "PENDENTE" || p.status === "ATRASADO"),
    pagamentos: store.pagamentos,
  };
}

function estatisticasResumo() {
  const golsByPlayer = new Map<string, { jogadorId: string; jogadorNome: string; turmaId: string; turmaNome: string; total: number }>();
  for (const gol of store.gols) {
    const key = gol.jogadorId;
    const cur = golsByPlayer.get(key) ?? { jogadorId: gol.jogadorId, jogadorNome: gol.jogadorNome, turmaId: gol.turmaId, turmaNome: gol.turmaNome, total: 0 };
    cur.total++;
    golsByPlayer.set(key, cur);
  }
  const artilharia = [...golsByPlayer.values()].sort((a, b) => b.total - a.total);

  const simByPlayer = new Map<string, { jogadorId: string; jogadorNome: string; turmaId: string; turmaNome: string; total: number }>();
  for (const p of store.presencas.filter((p) => p.resposta === "SIM")) {
    const jogador = store.jogadores.find((j) => j.id === p.jogadorId);
    const jogo    = store.jogos.find((j) => j.id === p.jogoId);
    const turma   = store.turmas.find((t) => t.id === jogo?.turmaId);
    if (!jogador) continue;
    const cur = simByPlayer.get(p.jogadorId) ?? { jogadorId: p.jogadorId, jogadorNome: jogador.nome, turmaId: jogador.turmaId, turmaNome: turma?.nome ?? "Turma", total: 0 };
    cur.total++;
    simByPlayer.set(p.jogadorId, cur);
  }
  const presencaRanking = [...simByPlayer.values()].sort((a, b) => b.total - a.total);

  return { gols: store.gols, artilharia, presencaRanking };
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function computeDashboard(): DashboardData {
  return {
    turmas: store.turmas.map((t) => ({ ...t })),
    jogadores: store.jogadores.map((j) => ({ ...j })),
    financeiro: financeiroResumo(),
    jogos: jogosAsSummary(),
    presencas: presencasAsSummary(),
    timesGerados: timesAsSummary(),
    estatisticas: estatisticasResumo(),
  };
}

// ─── Mutations: Jogadores ─────────────────────────────────────────────────────

export function createJogador(input: { turmaId: string; nome: string; telefone: string; email?: string; posicao: string; nivel: number }): JogadorSummary {
  const jogador: JogadorSummary = {
    id: uid("j", store.jogadores),
    turmaId: input.turmaId,
    nome: input.nome,
    telefone: normalizePhone(input.telefone),
    email: input.email ?? null,
    posicao: input.posicao as JogadorSummary["posicao"],
    nivel: input.nivel,
    ativo: true,
  };
  store.jogadores.push(jogador);
  const turma = store.turmas.find((t) => t.id === input.turmaId);
  if (turma) turma.totalJogadores = (turma.totalJogadores ?? 0) + 1;
  return { ...jogador };
}

export function updateJogador(id: string, input: Partial<{ nome: string; telefone: string; email: string | null; posicao: string; nivel: number; ativo: boolean }>): JogadorSummary {
  const j = store.jogadores.find((j) => j.id === id);
  if (!j) throw new Error("Jogador não encontrado");
  if (input.nome      !== undefined) j.nome      = input.nome;
  if (input.telefone  !== undefined) j.telefone  = normalizePhone(input.telefone);
  if (input.email     !== undefined) j.email     = input.email;
  if (input.posicao   !== undefined) j.posicao   = input.posicao as JogadorSummary["posicao"];
  if (input.nivel     !== undefined) j.nivel     = input.nivel;
  if (input.ativo     !== undefined) j.ativo     = input.ativo;
  return { ...j };
}

export function deleteJogador(id: string): void {
  const idx = store.jogadores.findIndex((j) => j.id === id);
  if (idx !== -1) {
    const turma = store.turmas.find((t) => t.id === store.jogadores[idx]!.turmaId);
    if (turma && turma.totalJogadores) turma.totalJogadores--;
    store.jogadores.splice(idx, 1);
  }
}

// ─── Mutations: Turmas ────────────────────────────────────────────────────────

export function createTurma(input: { nome: string; local?: string; diaSemana: number; horario: string; mensalidade: number }): TurmaSummary {
  const turma: TurmaSummary = {
    id: uid("turma", store.turmas),
    nome: input.nome,
    local: input.local ?? null,
    diaSemana: input.diaSemana,
    horario: input.horario,
    mensalidade: input.mensalidade,
    status: "ATIVA",
    totalJogadores: 0,
  };
  store.turmas.unshift(turma);
  return { ...turma };
}

export function updateTurma(id: string, input: Partial<{ nome: string; local: string | null; diaSemana: number; horario: string; mensalidade: number }>): TurmaSummary {
  const t = store.turmas.find((t) => t.id === id);
  if (!t) throw new Error("Turma não encontrada");
  if (input.nome        !== undefined) t.nome        = input.nome;
  if (input.local       !== undefined) t.local       = input.local;
  if (input.diaSemana   !== undefined) t.diaSemana   = input.diaSemana;
  if (input.horario     !== undefined) t.horario     = input.horario;
  if (input.mensalidade !== undefined) t.mensalidade = input.mensalidade;
  return { ...t };
}

// ─── Mutations: Jogos ─────────────────────────────────────────────────────────

export function createJogo(input: { turmaId: string; dataJogo: string }): JogoSummary {
  const jogo: DemoGame = {
    id: uid("g", store.jogos),
    turmaId: input.turmaId,
    dataJogo: input.dataJogo,
    status: "RASCUNHO",
  };
  store.jogos.unshift(jogo);
  const turma = store.turmas.find((t) => t.id === input.turmaId);
  return {
    id: jogo.id,
    turmaId: jogo.turmaId,
    turmaNome: turma?.nome ?? "Turma",
    dataJogo: jogo.dataJogo,
    status: jogo.status,
    confirmados: 0,
    recusados: 0,
    pendentes: 0,
  };
}

// ─── Mutations: Times ─────────────────────────────────────────────────────────

export function generateTimes(jogoId: string): TimeSummary[] {
  const jogo = store.jogos.find((j) => j.id === jogoId);
  if (!jogo) throw new Error("Jogo não encontrado");

  const confirmed = store.presencas
    .filter((p) => p.jogoId === jogoId && p.resposta === "SIM")
    .map((p) => store.jogadores.find((j) => j.id === p.jogadorId)!)
    .filter(Boolean)
    .map((j) => ({ id: j.id, nome: j.nome, posicao: j.posicao, nivel: j.nivel }));

  if (confirmed.length < 2) throw new Error("Jogadores confirmados insuficientes para gerar times");

  const generated = generateBalancedTeams(confirmed);

  store.times = store.times.filter((t) => !t.id.startsWith(`${jogoId}-`));
  store.presencas.forEach((p) => { if (p.jogoId === jogoId) p.timeId = null; });

  const persisted = generated.map((team, idx) => {
    const t: DemoTeam = {
      id: `${jogoId}-team-${idx + 1}`,
      jogoId,
      nome: team.nome,
      cor: team.cor,
      nivelMedio: team.nivelMedio,
      jogadores: team.jogadores,
    };
    store.times.push(t);
    for (const player of team.jogadores) {
      const p = store.presencas.find((p) => p.jogoId === jogoId && p.jogadorId === player.id);
      if (p) p.timeId = t.id;
    }
    return t;
  });

  jogo.status = "TIMES_GERADOS";

  return persisted.map((t) => {
    const turma = store.turmas.find((tu) => tu.id === jogo.turmaId);
    return { id: t.id, jogoId: t.jogoId, turmaNome: turma?.nome ?? "Turma", nome: t.nome, cor: t.cor ?? null, nivelMedio: t.nivelMedio, jogadores: t.jogadores.map((j) => j.nome) };
  });
}

// ─── Mutations: Pagamentos ────────────────────────────────────────────────────

export function markPagamentoPago(id: string): PagamentoSummary {
  const p = store.pagamentos.find((p) => p.id === id);
  if (!p) throw new Error("Pagamento não encontrado");
  p.status = "PAGO";
  p.pagoEm = new Date().toISOString();
  return { ...p };
}

// ─── Mutations: Presencas ─────────────────────────────────────────────────────

export function updatePresenca(id: string, resposta: RespostaPresenca): void {
  const p = store.presencas.find((p) => p.id === id);
  if (!p) throw new Error("Presença não encontrada");
  p.resposta = resposta;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function findUserByCredentials(email: string, password: string): DemoUser | null {
  return store.users.find((u) => u.email === email && u.password === password) ?? null;
}

export function findUserById(id: string): DemoUser | null {
  return store.users.find((u) => u.id === id) ?? null;
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  teamName: string
): { userId: string; turmaId: string } {
  if (store.users.find((u) => u.email === email)) {
    throw new Error("Email já cadastrado.");
  }
  const turma = createTurma({ nome: teamName, diaSemana: 3, horario: "20:00", mensalidade: 80 });
  const user: DemoUser = {
    id: uid("user", store.users),
    name,
    email,
    password,
    phone: null,
    role: "ADMIN",
    activeTeamId: turma.id,
  };
  store.users.push(user);
  store.memberships.push({ userId: user.id, turmaId: turma.id, role: "ADMIN" });
  return { userId: user.id, turmaId: turma.id };
}

export function updateUserProfile(
  userId: string,
  input: Partial<{ name: string; phone: string | null }>
): DemoUser {
  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error("Usuário não encontrado.");
  if (input.name  !== undefined) user.name  = input.name;
  if (input.phone !== undefined) user.phone = input.phone;
  return { ...user };
}

export function getUserMemberships(userId: string) {
  return store.memberships
    .filter((m) => m.userId === userId)
    .map((m) => {
      const turma = store.turmas.find((t) => t.id === m.turmaId);
      return { turmaId: m.turmaId, turmaNome: turma?.nome ?? "Turma", role: m.role };
    });
}

// ─── Invites ──────────────────────────────────────────────────────────────────

function randomToken(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export function createInvite(turmaId: string, role: "ADMIN" | "PLAYER" = "PLAYER"): DemoInvite {
  const turma = store.turmas.find((t) => t.id === turmaId);
  if (!turma) throw new Error("Turma não encontrada.");
  const invite: DemoInvite = {
    id: uid("inv", store.invites),
    token: randomToken(),
    turmaId,
    turmaNome: turma.nome,
    role,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    usedAt: null,
  };
  store.invites.push(invite);
  return invite;
}

export function getInvite(token: string): DemoInvite | null {
  const invite = store.invites.find((i) => i.token === token);
  if (!invite) return null;
  if (invite.usedAt) return null;
  if (new Date(invite.expiresAt) < new Date()) return null;
  return invite;
}

export function acceptInvite(token: string, userId: string): void {
  const invite = getInvite(token);
  if (!invite) throw new Error("Convite inválido ou expirado.");
  const already = store.memberships.find((m) => m.userId === userId && m.turmaId === invite.turmaId);
  if (!already) {
    store.memberships.push({ userId, turmaId: invite.turmaId, role: invite.role });
    const user = store.users.find((u) => u.id === userId);
    if (user) user.activeTeamId = invite.turmaId;
  }
  invite.usedAt = new Date().toISOString();
}

// ─── Mutations: Presencas ─────────────────────────────────────────────────────

export function dispararPresencas(turmaId: string, dataJogo: string): { jogoId: string; playerCount: number } {
  const turma = store.turmas.find((t) => t.id === turmaId);
  if (!turma) throw new Error("Turma não encontrada");

  let jogo = store.jogos.find((j) => j.turmaId === turmaId && j.dataJogo === dataJogo.slice(0, 10));
  if (!jogo) {
    jogo = { id: uid("g", store.jogos), turmaId, dataJogo: dataJogo.slice(0, 10), status: "CONFIRMACAO_ABERTA" };
    store.jogos.push(jogo);
  } else {
    jogo.status = "CONFIRMACAO_ABERTA";
  }

  const jogadores = store.jogadores.filter((j) => j.turmaId === turmaId && j.ativo);
  for (const jogador of jogadores) {
    const existing = store.presencas.find((p) => p.jogoId === jogo!.id && p.jogadorId === jogador.id);
    if (!existing) {
      store.presencas.push({ id: uid("p", store.presencas), jogoId: jogo.id, jogadorId: jogador.id, resposta: "PENDENTE", timeId: null });
    }
  }

  return { jogoId: jogo.id, playerCount: jogadores.length };
}
