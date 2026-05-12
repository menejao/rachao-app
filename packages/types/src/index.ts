export type TurmaStatus = "ATIVA" | "INATIVA";
export type WhatsappConnectionStatus = "NAO_CONECTADO" | "AGUARDANDO" | "CONECTADO" | "ERRO";
export type Posicao = "GOLEIRO" | "FIXO" | "ALA" | "PIVO" | "CORINGA";
export type JogoStatus =
  | "RASCUNHO"
  | "CONFIRMACAO_ABERTA"
  | "FECHADO"
  | "TIMES_GERADOS"
  | "FINALIZADO";

export interface JogadorSummary {
  id: string;
  turmaId: string;
  nome: string;
  telefone: string;
  email?: string | null;
  posicao: Posicao;
  nivel: number;
  ativo: boolean;
}

export interface TurmaSummary {
  id: string;
  nome: string;
  local?: string | null;
  diaSemana: number;
  horario: string;
  mensalidade: number;
  status: TurmaStatus;
  whatsappGroupId?: string | null;
  whatsappProvider?: string | null;
  whatsappStatus?: WhatsappConnectionStatus;
  whatsappActivationCode?: string | null;
  whatsappConnectedAt?: string | null;
  whatsappLastActivity?: string | null;
  whatsappGroupName?: string | null;
  createdAt?: string;
  updatedAt?: string;
  totalJogadores?: number;
}

export interface CreateTurmaInput {
  nome: string;
  local?: string;
  diaSemana: number;
  horario: string;
  mensalidade: number;
  organizadorId: string;
  whatsappGroupId?: string;
  whatsappProvider?: string;
}

export interface CreateJogadorInput {
  turmaId: string;
  nome: string;
  telefone: string;
  email?: string;
  posicao: Posicao;
  nivel: number;
}

export interface DashboardData {
  turmas: TurmaSummary[];
  jogadores: JogadorSummary[];
  financeiro: FinanceiroResumo;
  jogos: JogoSummary[];
  presencas: PresencaSummary[];
  timesGerados: TimeSummary[];
  estatisticas: EstatisticasResumo;
}

export type RespostaPresenca = "SIM" | "NAO" | "PENDENTE";
export type WhatsAppProvider = "mock" | "evolution" | "zapi";

export interface PresenceDispatchInput {
  turmaId: string;
  dataJogo: string;
  message?: string;
}

export interface PresenceWebhookInput {
  provider: WhatsAppProvider;
  groupId?: string;
  fromPhone: string;
  message: string;
}

export interface EventoLogEntry {
  id: string;
  tipo: string;
  origem: string;
  turmaId?: string | null;
  jogoId?: string | null;
  jogadorId?: string | null;
  payload?: unknown;
  createdAt: string;
}

export interface TeamDraftPlayer {
  id: string;
  nome: string;
  posicao: Posicao;
  nivel: number;
}

export interface GeneratedTeam {
  nome: string;
  cor?: string;
  nivelMedio: number;
  jogadores: TeamDraftPlayer[];
}

export type PagamentoStatus = "PENDENTE" | "PAGO" | "ATRASADO" | "ISENTO";

export interface PagamentoSummary {
  id: string;
  turmaId: string;
  jogadorId: string;
  jogadorNome: string;
  referenciaMes: number;
  referenciaAno: number;
  valor: number;
  status: PagamentoStatus;
  pagoEm?: string | null;
}

export interface CreatePagamentoInput {
  turmaId: string;
  jogadorId: string;
  referenciaMes: number;
  referenciaAno: number;
  valor: number;
  status?: PagamentoStatus;
}

export interface UpdatePagamentoInput {
  valor?: number;
  status?: PagamentoStatus;
}

export interface FinanceiroResumo {
  saldoMensal: number;
  recebidosMes: number;
  pendentesMes: number;
  inadimplentes: PagamentoSummary[];
  pagamentos: PagamentoSummary[];
}

export interface JogoSummary {
  id: string;
  turmaId: string;
  turmaNome: string;
  dataJogo: string;
  status: JogoStatus;
  confirmados: number;
  recusados: number;
  pendentes: number;
  limitJogadores?: number | null;
  naFila?: number;
}

export interface PresencaSummary {
  id: string;
  jogoId: string;
  jogadorId: string;
  jogadorNome: string;
  turmaNome: string;
  resposta: RespostaPresenca;
  timeNome?: string | null;
  posicaoFila?: number | null;
}

export interface TimeSummary {
  id: string;
  jogoId: string;
  turmaNome: string;
  nome: string;
  cor?: string | null;
  nivelMedio: number;
  jogadores: string[];
}

export interface GoalSummary {
  id: string;
  jogoId: string;
  jogadorId: string;
  jogadorNome: string;
  turmaId: string;
  turmaNome: string;
  assistenciaId?: string | null;
  assistenciaNome?: string | null;
  minuto?: number | null;
  createdAt: string;
}

export interface RankingEntry {
  jogadorId: string;
  jogadorNome: string;
  turmaId: string;
  turmaNome: string;
  total: number;
}

export interface EstatisticasResumo {
  gols: GoalSummary[];
  artilharia: RankingEntry[];
  presencaRanking: RankingEntry[];
}
