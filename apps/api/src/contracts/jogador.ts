import { z } from "zod";

export const createJogadorSchema = z.object({
  turmaId: z.string().min(3),
  nome: z.string().min(2),
  telefone: z.string().min(10),
  email: z.string().email().optional(),
  posicao: z.enum(["GOLEIRO", "FIXO", "ALA", "PIVO", "CORINGA"]),
  nivel: z.number().int().min(1).max(5),
});

export const updateJogadorSchema = z.object({
  nome: z.string().min(2).optional(),
  telefone: z.string().min(10).optional(),
  email: z.string().email().nullable().optional(),
  posicao: z.enum(["GOLEIRO", "FIXO", "ALA", "PIVO", "CORINGA"]).optional(),
  nivel: z.number().int().min(1).max(5).optional(),
  ativo: z.boolean().optional(),
});

export const listJogadoresQuerySchema = z.object({
  turmaId: z.string().optional(),
});
