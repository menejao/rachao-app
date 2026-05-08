import { z } from "zod";

export const createTurmaSchema = z.object({
  nome: z.string().min(3),
  local: z.string().min(2).optional(),
  diaSemana: z.number().int().min(0).max(6),
  horario: z.string().regex(/^\d{2}:\d{2}$/),
  mensalidade: z.number().nonnegative(),
  organizadorId: z.string().min(3),
});

export const listTurmasQuerySchema = z.object({
  organizadorId: z.string().optional(),
});

export const updateTurmaSchema = z.object({
  nome: z.string().min(3).optional(),
  local: z.string().min(2).nullable().optional(),
  diaSemana: z.number().int().min(0).max(6).optional(),
  horario: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  mensalidade: z.number().nonnegative().optional(),
});
