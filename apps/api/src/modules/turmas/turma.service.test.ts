import assert from "node:assert/strict";
import type { CreateTurmaInput, TurmaSummary } from "@rachao/types";
import type { TurmaRepository } from "./turma.repository";
import { TurmaService } from "./turma.service";

class InMemoryTurmaRepository implements TurmaRepository {
  private readonly items: TurmaSummary[] = [];

  async list() {
    return this.items;
  }

  async create(input: CreateTurmaInput) {
    const turma: TurmaSummary = {
      id: "t1",
      nome: input.nome,
      local: input.local ?? null,
      diaSemana: input.diaSemana,
      horario: input.horario,
      mensalidade: input.mensalidade,
      status: "ATIVA",
      totalJogadores: 0,
    };
    this.items.push(turma);
    return turma;
  }
}

export async function runTurmaServiceTests() {
  const service = new TurmaService(new InMemoryTurmaRepository());
  const created = await service.create({
    nome: "Quarta 20h",
    local: "Arena",
    diaSemana: 3,
    horario: "20:00",
    mensalidade: 80,
    organizadorId: "org1",
  });

  assert.equal(created.nome, "Quarta 20h");
  assert.equal(created.mensalidade, 80);
}
