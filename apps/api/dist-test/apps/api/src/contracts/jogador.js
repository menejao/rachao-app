"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJogadoresQuerySchema = exports.createJogadorSchema = void 0;
const zod_1 = require("zod");
exports.createJogadorSchema = zod_1.z.object({
    turmaId: zod_1.z.string().min(3),
    nome: zod_1.z.string().min(2),
    telefone: zod_1.z.string().min(10),
    email: zod_1.z.string().email().optional(),
    posicao: zod_1.z.enum(["GOLEIRO", "FIXO", "ALA", "PIVO", "CORINGA"]),
    nivel: zod_1.z.number().int().min(1).max(5),
});
exports.listJogadoresQuerySchema = zod_1.z.object({
    turmaId: zod_1.z.string().optional(),
});
