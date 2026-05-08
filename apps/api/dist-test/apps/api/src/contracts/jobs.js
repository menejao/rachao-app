"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runJobSchema = void 0;
const zod_1 = require("zod");
exports.runJobSchema = zod_1.z.object({
    job: zod_1.z.enum(["send_confirmation", "remind_pending", "close_list", "generate_teams"]),
    referenceDate: zod_1.z.string().optional(),
});
