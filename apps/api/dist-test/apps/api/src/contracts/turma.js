"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTurmasQuerySchema = exports.createTurmaSchema = void 0;
const zod_1 = require("zod");
exports.createTurmaSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3),
    local: zod_1.z.string().min(2).optional(),
    diaSemana: zod_1.z.number().int().min(0).max(6),
    horario: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
    mensalidade: zod_1.z.number().nonnegative(),
    organizadorId: zod_1.z.string().min(3),
});
exports.listTurmasQuerySchema = zod_1.z.object({
    organizadorId: zod_1.z.string().optional(),
});
