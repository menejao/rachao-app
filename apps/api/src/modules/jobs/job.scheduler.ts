import { getMinuteKey, matchesCron } from "@rachao/utils";
import type { WeeklyJobName } from "./job.service";
import type { JobService } from "./job.service";

export interface JobSchedulerConfig {
  enabled: boolean;
  tickMs: number;
  jobs: Array<{ name: WeeklyJobName; cron: string }>;
}

export class JobScheduler {
  private timer?: NodeJS.Timeout;
  private readonly executed = new Set<string>();

  constructor(private readonly service: JobService, private readonly config: JobSchedulerConfig) {}

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

  async tick(now: Date) {
    const minuteKey = getMinuteKey(now);

    for (const job of this.config.jobs) {
      const executionKey = `${job.name}:${minuteKey}`;
      if (!matchesCron(job.cron, now) || this.executed.has(executionKey)) {
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
