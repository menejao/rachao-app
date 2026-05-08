import type { PrismaClient } from "@prisma/client";
import type { CreateTurmaInput, TurmaSummary } from "@rachao/types";

export interface TurmaRepository {
  list(filters?: { organizadorId?: string }): Promise<TurmaSummary[]>;
  create(input: CreateTurmaInput): Promise<TurmaSummary>;
}

export class PrismaTurmaRepository implements TurmaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters?: { organizadorId?: string }) {
    const turmas = await this.prisma.turma.findMany({
      where: filters?.organizadorId ? { organizadorId: filters.organizadorId } : undefined,
      include: {
        _count: {
          select: { jogadores: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return turmas.map((turma) => ({
      id: turma.id,
      nome: turma.nome,
      local: turma.local,
      diaSemana: turma.diaSemana,
      horario: turma.horario,
      mensalidade: Number(turma.mensalidade),
      status: turma.status,
      createdAt: turma.createdAt.toISOString(),
      updatedAt: turma.updatedAt.toISOString(),
      totalJogadores: turma._count.jogadores,
    }));
  }

  async create(input: CreateTurmaInput) {
    const organizador = await this.prisma.organizador.upsert({
      where: { id: input.organizadorId },
      create: {
        id: input.organizadorId,
        nome: "Organizador MVP",
        email: `${input.organizadorId}@rachao.local`,
      },
      update: {},
    });

    const turma = await this.prisma.turma.create({
      data: {
        nome: input.nome,
        local: input.local,
        diaSemana: input.diaSemana,
        horario: input.horario,
        mensalidade: input.mensalidade,
        organizadorId: organizador.id,
        whatsappGroupId: input.whatsappGroupId,
        whatsappProvider: input.whatsappProvider,
      },
    });

    return {
      id: turma.id,
      nome: turma.nome,
      local: turma.local,
      diaSemana: turma.diaSemana,
      horario: turma.horario,
      mensalidade: Number(turma.mensalidade),
      status: turma.status,
      createdAt: turma.createdAt.toISOString(),
      updatedAt: turma.updatedAt.toISOString(),
      totalJogadores: 0,
    };
  }
}
