import { z } from "zod";

export const createPagamentoSchema = z.object({
  turmaId: z.string().min(3),
  jogadorId: z.string().min(2),
  referenciaMes: z.number().int().min(1).max(12),
  referenciaAno: z.number().int().min(2024).max(2100),
  valor: z.number().nonnegative(),
  status: z.enum(["PENDENTE", "PAGO", "ATRASADO", "ISENTO"]).optional(),
});

export const listPagamentosQuerySchema = z.object({
  turmaId: z.string().optional(),
  referenciaMes: z.coerce.number().int().min(1).max(12).optional(),
  referenciaAno: z.coerce.number().int().min(2024).max(2100).optional(),
});

export const updatePagamentoSchema = z.object({
  valor: z.number().nonnegative().optional(),
  status: z.enum(["PENDENTE", "PAGO", "ATRASADO", "ISENTO"]).optional(),
});

export const markPagamentoPagoSchema = z.object({
  pagoEm: z.string().datetime().optional(),
});

export const cobrarInadimplentesSchema = z.object({
  turmaId: z.string().min(3),
  referenciaMes: z.number().int().min(1).max(12),
  referenciaAno: z.number().int().min(2024).max(2100),
});
