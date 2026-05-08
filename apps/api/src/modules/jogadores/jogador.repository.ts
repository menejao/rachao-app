import type { PrismaClient } from "@prisma/client";
import type { CreateJogadorInput, JogadorSummary } from "@rachao/types";
import { normalizePhone } from "@rachao/utils";

export interface JogadorRepository {
  list(filters?: { turmaId?: string }): Promise<JogadorSummary[]>;
  create(input: CreateJogadorInput): Promise<JogadorSummary>;
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
      posicao: jogador.posicao,
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
      posicao: jogador.posicao,
      nivel: jogador.nivel,
      ativo: jogador.ativo,
    };
  }
}
