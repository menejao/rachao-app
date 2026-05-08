import type { PrismaClient } from "@prisma/client";
import type { CreateJogadorInput, JogadorSummary, Posicao } from "@rachao/types";
import { normalizePhone } from "@rachao/utils";

export type UpdateJogadorInput = {
  nome?: string;
  telefone?: string;
  email?: string | null;
  posicao?: Posicao;
  nivel?: number;
  ativo?: boolean;
};

export interface JogadorRepository {
  list(filters?: { turmaId?: string }): Promise<JogadorSummary[]>;
  create(input: CreateJogadorInput): Promise<JogadorSummary>;
  update(id: string, input: UpdateJogadorInput): Promise<JogadorSummary>;
  delete(id: string): Promise<void>;
}

export class PrismaJogadorRepository implements JogadorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters?: { turmaId?: string }) {
    const jogadores = await this.prisma.jogador.findMany({
      where: filters?.turmaId ? { turmaId: filters.turmaId } : undefined,
      orderBy: [{ turmaId: "asc" }, { nome: "asc" }],
    });

    return jogadores.map((jogador) => ({
      id: jogador.id,
      turmaId: jogador.turmaId,
      nome: jogador.nome,
      telefone: jogador.telefone,
      email: jogador.email,
      posicao: jogador.posicao as Posicao,
      nivel: jogador.nivel,
      ativo: jogador.ativo,
    }));
  }

  async create(input: CreateJogadorInput) {
    const turma = await this.prisma.turma.findUnique({
      where: { id: input.turmaId },
      select: { id: true },
    });

    if (!turma) {
      throw new Error("Turma não encontrada");
    }

    const jogador = await this.prisma.jogador.create({
      data: {
        turmaId: input.turmaId,
        nome: input.nome,
        telefone: normalizePhone(input.telefone),
        email: input.email,
        posicao: input.posicao,
        nivel: input.nivel,
      },
    });

    return {
      id: jogador.id,
      turmaId: jogador.turmaId,
      nome: jogador.nome,
      telefone: jogador.telefone,
      email: jogador.email,
      posicao: jogador.posicao as Posicao,
      nivel: jogador.nivel,
      ativo: jogador.ativo,
    };
  }

  async update(id: string, input: UpdateJogadorInput): Promise<JogadorSummary> {
    const jogador = await this.prisma.jogador.update({
      where: { id },
      data: {
        ...(input.nome !== undefined && { nome: input.nome }),
        ...(input.telefone !== undefined && { telefone: normalizePhone(input.telefone) }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.posicao !== undefined && { posicao: input.posicao }),
        ...(input.nivel !== undefined && { nivel: input.nivel }),
        ...(input.ativo !== undefined && { ativo: input.ativo }),
      },
    });

    return {
      id: jogador.id,
      turmaId: jogador.turmaId,
      nome: jogador.nome,
      telefone: jogador.telefone,
      email: jogador.email,
      posicao: jogador.posicao as Posicao,
      nivel: jogador.nivel,
      ativo: jogador.ativo,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.jogador.delete({ where: { id } });
  }
}
