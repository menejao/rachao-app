import { z } from "zod";

export const dispatchPresenceSchema = z.object({
  turmaId: z.string().min(3),
  dataJogo: z.string().min(10),
  message: z.string().min(5).optional(),
});

export const webhookMessageSchema = z.object({
  provider: z.enum(["mock", "evolution", "zapi"]).default("mock"),
  groupId: z.string().optional(),
  fromPhone: z.string().min(8),
  message: z.string().min(1),
});

export const listLogsQuerySchema = z.object({
  turmaId: z.string().optional(),
  jogoId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updatePresencaSchema = z.object({
  resposta: z.enum(["SIM", "NAO", "PENDENTE"]),
});
