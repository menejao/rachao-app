"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLogsQuerySchema = exports.webhookMessageSchema = exports.dispatchPresenceSchema = void 0;
const zod_1 = require("zod");
exports.dispatchPresenceSchema = zod_1.z.object({
    turmaId: zod_1.z.string().min(3),
    dataJogo: zod_1.z.string().min(10),
    message: zod_1.z.string().min(5).optional(),
});
exports.webhookMessageSchema = zod_1.z.object({
    provider: zod_1.z.enum(["mock", "evolution", "zapi"]).default("mock"),
    groupId: zod_1.z.string().optional(),
    fromPhone: zod_1.z.string().min(8),
    message: zod_1.z.string().min(1),
});
exports.listLogsQuerySchema = zod_1.z.object({
    turmaId: zod_1.z.string().optional(),
    jogoId: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
