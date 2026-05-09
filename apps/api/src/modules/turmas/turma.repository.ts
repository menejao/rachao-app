import type { PrismaClient } from "@prisma/client";
import type { CreateTurmaInput, TurmaSummary } from "@rachao/types";

export interface UpdateTurmaInput {
  nome?: string;
  local?: string | null;
  diaSemana?: number;
  horario?: string;
  mensalidade?: number;
}

export interface TurmaRepository {
  list(filters?: { organizadorId?: string }): Promise<TurmaSummary[]>;
  create(input: CreateTurmaInput): Promise<TurmaSummary>;
  update(id: string, input: UpdateTurmaInput): Promise<TurmaSummary>;
}

export class PrismaTurmaRepository implements TurmaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(_filters?: { organizadorId?: string }) {
    const turmas = await this.prisma.turma.findMany({
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
    const turma = await this.prisma.turma.create({
      data: {
        nome: input.nome,
        local: input.local,
        diaSemana: input.diaSemana,
        horario: input.horario,
        mensalidade: input.mensalidade,
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

  async update(id: string, input: UpdateTurmaInput): Promise<TurmaSummary> {
    const turma = await this.prisma.turma.update({
      where: { id },
      data: {
        ...(input.nome !== undefined && { nome: input.nome }),
        ...(input.local !== undefined && { local: input.local }),
        ...(input.diaSemana !== undefined && { diaSemana: input.diaSemana }),
        ...(input.horario !== undefined && { horario: input.horario }),
        ...(input.mensalidade !== undefined && { mensalidade: input.mensalidade }),
      },
      include: { _count: { select: { jogadores: true } } },
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
      totalJogadores: turma._count.jogadores,
    };
  }
}
