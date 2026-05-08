import assert from "node:assert/strict";
import type { PresenceDispatchContext, PresenceWebhookContext, PresencaRepository } from "./presenca.repository";
import { GolService } from "../gols/gol.service";
import type { GolRepository } from "../gols/gol.repository";
import type { LogRepository } from "../logs/log.repository";
import { PresencaService } from "./presenca.service";
import type { TimeService } from "../times/time.service";

class InMemoryLogRepository implements LogRepository {
  public readonly items: Array<{ tipo: string; origem: string }> = [];

  async create(input: { tipo: string; origem: string }) {
    this.items.push(input);
  }

  async list() {
    return [];
  }
}

class InMemoryPresencaRepository implements PresencaRepository {
  public responses: Array<{ jogoId: string; playerId: string; resposta: "SIM" | "NAO" }> = [];
  public dispatched = false;

  async getDispatchContext(): Promise<PresenceDispatchContext | null> {
    return {
      turmaId: "t1",
      turmaNome: "Quarta",
      whatsappGroupId: "group-1",
      whatsappProvider: "mock",
      jogadores: [{ id: "j1", nome: "Pedro", telefone: "11999990000" }],
    };
  }

  async createOrOpenGame() {
    return { id: "g1", dataJogo: new Date("2026-05-14") };
  }

  async upsertPendingPresencas() {
    this.dispatched = true;
  }

  async resolveWebhookContext(): Promise<PresenceWebhookContext | null> {
    return {
      jogoId: "g1",
      turmaId: "t1",
      playerId: "j1",
      playerName: "Pedro",
    };
  }

  async resolveTimesCommandContext() {
    return {
      jogoId: "g1",
      turmaId: "t1",
    };
  }

  async savePresenceResponse(input: { jogoId: string; playerId: string; resposta: "SIM" | "NAO" }) {
    this.responses.push(input);
  }

  async listForStats() {
    return [];
  }
}

class FakeTimeService {
  async generate() {
    return [
      { id: "time-1", nome: "Time Azul", nivelMedio: 4, jogadores: [] },
      { id: "time-2", nome: "Time Laranja", nivelMedio: 3, jogadores: [] },
    ];
  }
}

class InMemoryGolRepository implements GolRepository {
  public goals = 0;

  async resolveGoalCommandContext() {
    return {
      jogoId: "g1",
      turmaId: "t1",
      turmaNome: "Quarta",
      jogadorId: "j1",
      jogadorNome: "Pedro",
    };
  }

  async create() {
    this.goals += 1;
    return {
      id: "gol-1",
      jogoId: "g1",
      jogadorId: "j1",
      jogadorNome: "Pedro",
      turmaId: "t1",
      turmaNome: "Quarta",
      assistenciaId: null,
      assistenciaNome: null,
      minuto: null,
      createdAt: new Date().toISOString(),
    };
  }

  async list() {
    return [];
  }
}

export async function runPresencaServiceTests() {
  const logs = new InMemoryLogRepository();
  const repository = new InMemoryPresencaRepository();
  const goalRepository = new InMemoryGolRepository();
  const service = new PresencaService(
    repository,
    logs,
    new FakeTimeService() as unknown as TimeService,
    new GolService(goalRepository, logs)
  );

  const dispatch = await service.dispatchPresenceRequest({
    turmaId: "t1",
    dataJogo: "2026-05-14",
  });

  assert.equal(dispatch.ok, true);
  assert.equal(repository.dispatched, true);

  const webhook = await service.receivePresenceWebhook({
    provider: "mock",
    groupId: "group-1",
    fromPhone: "11999990000",
    message: "sim",
  });

  assert.equal(webhook.ok, true);
  assert.equal(repository.responses[0]?.resposta, "SIM");
  assert.ok(logs.items.length >= 2);

  const command = await service.receivePresenceWebhook({
    provider: "mock",
    groupId: "group-1",
    fromPhone: "11999990000",
    message: "/times",
  });

  assert.equal(command.ok, true);

  const goalCommand = await service.receivePresenceWebhook({
    provider: "mock",
    groupId: "group-1",
    fromPhone: "11999990000",
    message: "/gol @Pedro",
  });

  assert.equal(goalCommand.ok, true);
  assert.equal(goalRepository.goals, 1);
}
