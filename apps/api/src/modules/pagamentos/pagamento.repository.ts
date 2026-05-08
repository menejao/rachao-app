import type { PrismaClient } from "@prisma/client";
import type {
  CreatePagamentoInput,
  PagamentoSummary,
  UpdatePagamentoInput,
} from "@rachao/types";

export interface PagamentoRepository {
  list(filters?: {
    turmaId?: string;
    referenciaMes?: number;
    referenciaAno?: number;
  }): Promise<PagamentoSummary[]>;
  create(input: CreatePagamentoInput): Promise<PagamentoSummary>;
  update(id: string, input: UpdatePagamentoInput): Promise<PagamentoSummary>;
  markAsPaid(id: string, pagoEm?: string): Promise<PagamentoSummary>;
  delete(id: string): Promise<void>;
}

export class PrismaPagamentoRepository implements PagamentoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters?: { turmaId?: string; referenciaMes?: number; referenciaAno?: number }) {
    const rows = await this.prisma.pagamento.findMany({
      where: {
        turmaId: filters?.turmaId,
        referenciaMes: filters?.referenciaMes,
        referenciaAno: filters?.referenciaAno,
      },
      include: {
        jogador: true,
      },
      orderBy: [{ referenciaAno: "desc" }, { referenciaMes: "desc" }, { jogador: { nome: "asc" } }],
    });

    return rows.map((row) => ({
      id: row.id,
      turmaId: row.turmaId,
      jogadorId: row.jogadorId,
      jogadorNome: row.jogador.nome,
      referenciaMes: row.referenciaMes,
      referenciaAno: row.referenciaAno,
      valor: Number(row.valor),
      status: row.status,
      pagoEm: row.pagoEm?.toISOString() ?? null,
    }));
  }

  async create(input: CreatePagamentoInput) {
    const row = await this.prisma.pagamento.create({
      data: {
        turmaId: input.turmaId,
        jogadorId: input.jogadorId,
        referenciaMes: input.referenciaMes,
        referenciaAno: input.referenciaAno,
        valor: input.valor,
        status: input.status ?? "PENDENTE",
        pagoEm: input.status === "PAGO" ? new Date() : null,
      },
      include: { jogador: true },
    });

    return {
      id: row.id,
      turmaId: row.turmaId,
      jogadorId: row.jogadorId,
      jogadorNome: row.jogador.nome,
      referenciaMes: row.referenciaMes,
      referenciaAno: row.referenciaAno,
      valor: Number(row.valor),
      status: row.status,
      pagoEm: row.pagoEm?.toISOString() ?? null,
    };
  }

  async update(id: string, input: UpdatePagamentoInput) {
    const row = await this.prisma.pagamento.update({
      where: { id },
      data: {
        valor: input.valor,
        status: input.status,
        pagoEm: input.status === "PAGO" ? new Date() : input.status ? null : undefined,
      },
      include: { jogador: true },
    });

    return {
      id: row.id,
      turmaId: row.turmaId,
      jogadorId: row.jogadorId,
      jogadorNome: row.jogador.nome,
      referenciaMes: row.referenciaMes,
      referenciaAno: row.referenciaAno,
      valor: Number(row.valor),
      status: row.status,
      pagoEm: row.pagoEm?.toISOString() ?? null,
    };
  }

  async markAsPaid(id: string, pagoEm?: string) {
    const row = await this.prisma.pagamento.update({
      where: { id },
      data: {
        status: "PAGO",
        pagoEm: pagoEm ? new Date(pagoEm) : new Date(),
      },
      include: { jogador: true },
    });

    return {
      id: row.id,
      turmaId: row.turmaId,
      jogadorId: row.jogadorId,
      jogadorNome: row.jogador.nome,
      referenciaMes: row.referenciaMes,
      referenciaAno: row.referenciaAno,
      valor: Number(row.valor),
      status: row.status,
      pagoEm: row.pagoEm?.toISOString() ?? null,
    };
  }

  async delete(id: string) {
    await this.prisma.pagamento.delete({ where: { id } });
  }
}
