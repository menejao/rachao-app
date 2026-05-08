import assert from "node:assert/strict";
import type {
  CreatePagamentoInput,
  CreateJogadorInput,
  CreateTurmaInput,
  PagamentoSummary,
  TurmaSummary,
  UpdatePagamentoInput,
} from "@rachao/types";
import type { JogadorRepository } from "../jogadores/jogador.repository";
import type { LogRepository } from "../logs/log.repository";
import type { TurmaRepository } from "../turmas/turma.repository";
import type { PagamentoRepository } from "./pagamento.repository";
import { PagamentoService } from "./pagamento.service";

class InMemoryPagamentoRepository implements PagamentoRepository {
  public readonly items: PagamentoSummary[] = [
    {
      id: "pg1",
      turmaId: "t1",
      jogadorId: "j1",
      jogadorNome: "Leo",
      referenciaMes: 5,
      referenciaAno: 2026,
      valor: 80,
      status: "PAGO",
      pagoEm: "2026-05-01T12:00:00.000Z",
    },
    {
      id: "pg2",
      turmaId: "t1",
      jogadorId: "j2",
      jogadorNome: "Beto",
      referenciaMes: 5,
      referenciaAno: 2026,
      valor: 80,
      status: "ATRASADO",
      pagoEm: null,
    },
  ];

  async list(filters?: { turmaId?: string; referenciaMes?: number; referenciaAno?: number }) {
    return this.items.filter(
      (item) =>
        (!filters?.turmaId || item.turmaId === filters.turmaId) &&
        (!filters?.referenciaMes || item.referenciaMes === filters.referenciaMes) &&
        (!filters?.referenciaAno || item.referenciaAno === filters.referenciaAno)
    );
  }

  async create(input: CreatePagamentoInput) {
    const created: PagamentoSummary = {
      id: "pg3",
      turmaId: input.turmaId,
      jogadorId: input.jogadorId,
      jogadorNome: "Novo",
      referenciaMes: input.referenciaMes,
      referenciaAno: input.referenciaAno,
      valor: input.valor,
      status: input.status ?? "PENDENTE",
      pagoEm: null,
    };
    this.items.push(created);
    return created;
  }

  async update(id: string, input: UpdatePagamentoInput) {
    const pagamento = this.items.find((item) => item.id === id)!;
    if (typeof input.valor === "number") pagamento.valor = input.valor;
    if (input.status) pagamento.status = input.status;
    return pagamento;
  }

  async markAsPaid(id: string) {
    const pagamento = this.items.find((item) => item.id === id)!;
    pagamento.status = "PAGO";
    pagamento.pagoEm = new Date().toISOString();
    return pagamento;
  }

  async delete() {}
}

class InMemoryTurmaRepository implements TurmaRepository {
  async list() {
    return [
      {
        id: "t1",
        nome: "Quarta",
        diaSemana: 3,
        horario: "20:00",
        mensalidade: 80,
        status: "ATIVA" as const,
      },
    ];
  }
  async create(input: CreateTurmaInput): Promise<TurmaSummary> {
    return {
      id: "t2",
      nome: input.nome,
      local: input.local ?? null,
      diaSemana: input.diaSemana,
      horario: input.horario,
      mensalidade: input.mensalidade,
      status: "ATIVA",
      totalJogadores: 0,
    };
  }
}

class InMemoryJogadorRepository implements JogadorRepository {
  async list() {
    return [
      { id: "j1", turmaId: "t1", nome: "Leo", telefone: "1", posicao: "ALA" as const, nivel: 4, ativo: true },
      { id: "j2", turmaId: "t1", nome: "Beto", telefone: "2", posicao: "ALA" as const, nivel: 4, ativo: true },
    ];
  }
  async create(input: CreateJogadorInput) {
    return {
      id: "j3",
      turmaId: input.turmaId,
      nome: input.nome,
      telefone: input.telefone,
      email: input.email ?? null,
      posicao: input.posicao,
      nivel: input.nivel,
      ativo: true,
    };
  }
}

class InMemoryLogRepository implements LogRepository {
  public created = 0;
  async create() {
    this.created += 1;
  }
  async list() {
    return [];
  }
}

export async function runPagamentoServiceTests() {
  const logs = new InMemoryLogRepository();
  const service = new PagamentoService(
    new InMemoryPagamentoRepository(),
    new InMemoryTurmaRepository(),
    new InMemoryJogadorRepository(),
    logs
  );

  const resumo = await service.getResumo({
    turmaId: "t1",
    referenciaMes: 5,
    referenciaAno: 2026,
  });

  assert.equal(resumo.recebidosMes, 80);
  assert.equal(resumo.pendentesMes, 80);
  assert.equal(resumo.inadimplentes.length, 1);

  const result = await service.cobrarInadimplentes({
    turmaId: "t1",
    referenciaMes: 5,
    referenciaAno: 2026,
  });

  assert.equal(result.enviados, 1);
  assert.equal(logs.created, 1);
}
