"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cobrarInadimplentesSchema = exports.markPagamentoPagoSchema = exports.updatePagamentoSchema = exports.listPagamentosQuerySchema = exports.createPagamentoSchema = void 0;
const zod_1 = require("zod");
exports.createPagamentoSchema = zod_1.z.object({
    turmaId: zod_1.z.string().min(3),
    jogadorId: zod_1.z.string().min(2),
    referenciaMes: zod_1.z.number().int().min(1).max(12),
    referenciaAno: zod_1.z.number().int().min(2024).max(2100),
    valor: zod_1.z.number().nonnegative(),
    status: zod_1.z.enum(["PENDENTE", "PAGO", "ATRASADO", "ISENTO"]).optional(),
});
exports.listPagamentosQuerySchema = zod_1.z.object({
    turmaId: zod_1.z.string().optional(),
    referenciaMes: zod_1.z.coerce.number().int().min(1).max(12).optional(),
    referenciaAno: zod_1.z.coerce.number().int().min(2024).max(2100).optional(),
});
exports.updatePagamentoSchema = zod_1.z.object({
    valor: zod_1.z.number().nonnegative().optional(),
    status: zod_1.z.enum(["PENDENTE", "PAGO", "ATRASADO", "ISENTO"]).optional(),
});
exports.markPagamentoPagoSchema = zod_1.z.object({
    pagoEm: zod_1.z.string().datetime().optional(),
});
exports.cobrarInadimplentesSchema = zod_1.z.object({
    turmaId: zod_1.z.string().min(3),
    referenciaMes: zod_1.z.number().int().min(1).max(12),
    referenciaAno: zod_1.z.number().int().min(2024).max(2100),
});
