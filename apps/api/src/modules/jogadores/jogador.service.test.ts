import assert from "node:assert/strict";
import type { CreateJogadorInput, JogadorSummary } from "@rachao/types";
import type { JogadorRepository } from "./jogador.repository";
import { JogadorService } from "./jogador.service";

class InMemoryJogadorRepository implements JogadorRepository {
  private readonly items: JogadorSummary[] = [];

  async list() {
    return this.items;
  }

  async create(input: CreateJogadorInput) {
    const jogador: JogadorSummary = {
      id: "j1",
      turmaId: input.turmaId,
      nome: input.nome,
      telefone: input.telefone,
      email: input.email ?? null,
      posicao: input.posicao,
      nivel: input.nivel,
      ativo: true,
    };
    this.items.push(jogador);
    return jogador;
  }
}

export async function runJogadorServiceTests() {
  const service = new JogadorService(new InMemoryJogadorRepository());
  const created = await service.create({
    turmaId: "t1",
    nome: "Pedro",
    telefone: "11999991234",
    posicao: "ALA",
    nivel: 4,
  });

  assert.equal(created.nome, "Pedro");
  assert.equal(created.posicao, "ALA");
}
