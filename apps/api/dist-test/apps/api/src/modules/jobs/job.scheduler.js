"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobScheduler = void 0;
const utils_1 = require("@rachao/utils");
class JobScheduler {
    service;
    config;
    timer;
    executed = new Set();
    constructor(service, config) {
        this.service = service;
        this.config = config;
    }
    start() {
        if (!this.config.enabled || this.timer) {
            return;
        }
        this.timer = setInterval(() => {
            void this.tick(new Date());
        }, this.config.tickMs);
        void this.tick(new Date());
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }
    async tick(now) {
        const minuteKey = (0, utils_1.getMinuteKey)(now);
        for (const job of this.config.jobs) {
            const executionKey = `${job.name}:${minuteKey}`;
            if (!(0, utils_1.matchesCron)(job.cron, now) || this.executed.has(executionKey)) {
                continue;
            }
            this.executed.add(executionKey);
            await this.service.run(job.name, now);
        }
        if (this.executed.size > 500) {
            const recent = [...this.executed].slice(-200);
            this.executed.clear();
            for (const item of recent) {
                this.executed.add(item);
            }
        }
    }
}
exports.JobScheduler = JobScheduler;
