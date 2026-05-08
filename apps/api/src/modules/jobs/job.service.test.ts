import assert from "node:assert/strict";
import type { LogRepository } from "../logs/log.repository";
import type { TimeService } from "../times/time.service";
import { JobScheduler } from "./job.scheduler";
import type { JobRepository } from "./job.repository";
import { JobService } from "./job.service";

class FakeLogRepository implements LogRepository {
  public readonly items: string[] = [];

  async create(input: { tipo: string }) {
    this.items.push(input.tipo);
  }

  async list() {
    return [];
  }
}

class FakeJobRepository implements JobRepository {
  public statuses = new Map<string, "CONFIRMACAO_ABERTA" | "FECHADO" | "TIMES_GERADOS">([
    ["g1", "CONFIRMACAO_ABERTA"],
    ["g2", "FECHADO"],
  ]);

  async listScheduledTurmas() {
    return [
      {
        id: "t1",
        nome: "Quarta",
        diaSemana: 3,
        horario: "20:00",
        status: "ATIVA" as const,
        whatsappGroupId: "group-1",
        whatsappProvider: "mock" as const,
      },
    ];
  }

  async listPendingReminders() {
    return [
      {
        jogoId: "g1",
        turmaId: "t1",
        turmaNome: "Quarta",
        dataJogo: "2026-05-13T20:00:00.000Z",
        groupId: "group-1",
        provider: "mock" as const,
        pendingPlayers: ["Leo"],
      },
    ];
  }

  async listGamesByStatuses(statuses: Array<"CONFIRMACAO_ABERTA" | "FECHADO">) {
    return [...this.statuses.entries()]
      .filter(([, status]) => statuses.includes(status as "CONFIRMACAO_ABERTA" | "FECHADO"))
      .map(([jogoId, status]) => ({
        jogoId,
        turmaId: "t1",
        turmaNome: "Quarta",
        status: status as "CONFIRMACAO_ABERTA" | "FECHADO",
        groupId: "group-1",
        provider: "mock" as const,
        confirmedCount: 8,
      }));
  }

  async updateGameStatus(jogoId: string, status: "FECHADO" | "TIMES_GERADOS") {
    this.statuses.set(jogoId, status);
  }
}

class FakePresencaService {
  public dispatches: string[] = [];

  async dispatchPresenceRequest(input: { turmaId: string }) {
    this.dispatches.push(input.turmaId);
    return { ok: true };
  }
}

class FakeTimeService {
  public generated: string[] = [];

  async generate(jogoId: string) {
    this.generated.push(jogoId);
    return [];
  }
}

export async function runJobServiceTests() {
  const logs = new FakeLogRepository();
  const repository = new FakeJobRepository();
  const presencaService = new FakePresencaService();
  const timeService = new FakeTimeService();
  const service = new JobService(
    repository,
    presencaService as never,
    timeService as unknown as TimeService,
    logs
  );

  const send = await service.run("send_confirmation", new Date("2026-05-10T20:00:00"));
  assert.equal(send.ok, true);
  assert.equal(presencaService.dispatches.length, 1);

  const close = await service.run("close_list", new Date("2026-05-13T10:00:00"));
  assert.equal(close.processed, 1);
  assert.equal(repository.statuses.get("g1"), "FECHADO");

  const generate = await service.run("generate_teams", new Date("2026-05-13T10:01:00"));
  assert.equal(generate.processed, 2);
  assert.deepEqual(timeService.generated.sort(), ["g1", "g2"]);

  const scheduler = new JobScheduler(service, {
    enabled: true,
    tickMs: 1000,
    jobs: [{ name: "send_confirmation", cron: "0 20 * * 0" }],
  });
  await scheduler.tick(new Date("2026-05-10T20:00:00"));
  await scheduler.tick(new Date("2026-05-10T20:00:00"));
  assert.equal(presencaService.dispatches.length, 2);
}
