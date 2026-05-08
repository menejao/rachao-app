"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const cron_1 = require("./cron");
const date = new Date("2026-05-10T20:00:00");
strict_1.default.equal((0, cron_1.matchesCron)("0 20 * * 0", date), true);
strict_1.default.equal((0, cron_1.matchesCron)("0 18 * * 2", date), false);
strict_1.default.equal((0, cron_1.matchesCron)("0 20 * * 0,3", date), true);
strict_1.default.equal((0, cron_1.matchesCron)("0 19-21 * * 0", date), true);
strict_1.default.equal((0, cron_1.getMinuteKey)(date), "2026-5-10-20-0");
console.log("cron tests passed");
