"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTeamsSchema = void 0;
const zod_1 = require("zod");
exports.generateTeamsSchema = zod_1.z.object({
    jogoId: zod_1.z.string().min(3),
    teamCount: zod_1.z.number().int().min(2).max(6).optional(),
});
