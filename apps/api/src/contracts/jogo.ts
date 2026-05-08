import { z } from "zod";

export const createJogoSchema = z.object({
  turmaId: z.string().min(1),
  dataJogo: z.string().min(1),
  observacoes: z.string().optional(),
});
