import { z } from "zod";

export const CreateJogoSchema = z.object({
  turmaId: z.string().optional(),
  dataJogo: z.string().min(1, "dataJogo obrigatório"),
  limitJogadores: z.number().int().positive().nullable().optional(),
  observacoes: z.string().optional(),
});

export const UpdateJogoSchema = z.object({
  status: z.enum(["RASCUNHO", "CONFIRMACAO_ABERTA", "FECHADO", "TIMES_GERADOS", "FINALIZADO"]).optional(),
  observacoes: z.string().optional(),
  limitJogadores: z.number().int().positive().nullable().optional(),
});

export const CreateJogadorSchema = z.object({
  turmaId: z.string().optional(),
  nome: z.string().min(1, "nome obrigatório"),
  telefone: z.string().min(1, "telefone obrigatório"),
  email: z.string().email("email inválido").optional(),
  posicao: z.enum(["GOLEIRO", "FIXO", "ALA", "PIVO", "CORINGA"]),
  nivel: z.number().int().min(1).max(5),
});

export const UpdateJogadorSchema = z.object({
  nome: z.string().min(1).optional(),
  telefone: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  posicao: z.enum(["GOLEIRO", "FIXO", "ALA", "PIVO", "CORINGA"]).optional(),
  nivel: z.number().int().min(1).max(5).optional(),
  ativo: z.boolean().optional(),
});

export const CreateTurmaSchema = z.object({
  nome: z.string().min(1, "nome obrigatório"),
  local: z.string().optional(),
  diaSemana: z.number().int().min(0).max(6),
  horario: z.string().min(1, "horario obrigatório"),
  mensalidade: z.number().nonnegative(),
});

export const UpdateTurmaSchema = z.object({
  nome: z.string().min(1).optional(),
  local: z.string().nullable().optional(),
  diaSemana: z.number().int().min(0).max(6).optional(),
  horario: z.string().min(1).optional(),
  mensalidade: z.number().nonnegative().optional(),
  status: z.enum(["ATIVA", "INATIVA"]).optional(),
  whatsappGroupId: z.string().nullable().optional(),
  whatsappProvider: z.enum(["zapi", "evolution", "mock"]).nullable().optional(),
  autoConfirmacaoHoras: z.number().int().min(1).max(720).optional(),
  autoLembreteHoras: z.number().int().min(1).max(720).optional(),
  autoFechamentoHoras: z.number().int().min(1).max(48).optional(),
  autoTimesHoras: z.number().int().min(1).max(24).optional(),
  cobrancaDiaVencimento: z.number().int().min(1).max(28).optional(),
  cobrancaLembreteDiasAntes: z.number().int().min(0).max(30).optional(),
  cobrancaLembreteDia: z.boolean().optional(),
  cobrancaLembreteApos: z.number().int().min(0).max(30).optional(),
  pixKey: z.string().nullable().optional(),
  mensagemCobranca: z.string().nullable().optional(),
});

export const UpdatePresencaSchema = z.object({
  resposta: z.enum(["SIM", "NAO", "PENDENTE"]),
});

export const DispararPresencasSchema = z.object({
  turmaId: z.string().optional(),
  dataJogo: z.string().min(1, "dataJogo obrigatória"),
});

export const CreateInviteSchema = z.object({
  role: z.enum(["ADMIN", "PLAYER"]).optional(),
  turmaId: z.string().optional(),
});

export const AvisoSchema = z.object({
  turmaId: z.string().min(1, "turmaId obrigatório"),
  mensagem: z.string().min(1, "mensagem obrigatória"),
  apenasAtivos: z.boolean().optional(),
});

export const LembreteSchema = z.object({
  jogoId: z.string().min(1, "jogoId obrigatório"),
});

export const CobrancaSchema = z.union([
  z.object({ pagamentoId: z.string().min(1) }),
  z.object({
    turmaId: z.string().min(1),
    mes: z.number().int().min(1).max(12),
    ano: z.number().int().min(2020),
    pagamentoId: z.undefined().optional(),
  }),
]);

export const NotifPrefsSchema = z.object({
  whatsappEnabled: z.boolean().optional(),
  paymentReminderEnabled: z.boolean().optional(),
  gameReminderEnabled: z.boolean().optional(),
  presenceReminderEnabled: z.boolean().optional(),
});
