import type { PrismaClient } from "@prisma/client";
import type { GoalSummary } from "@rachao/types";
import { normalizeName } from "@rachao/utils";

export interface GoalCommandContext {
  jogoId: string;
  turmaId: string;
  turmaNome: string;
  jogadorId: string;
  jogadorNome: string;
}

export interface GolRepository {
  resolveGoalCommandContext(input: { groupId?: string; playerName: string }): Promise<GoalCommandContext | null>;
  create(input: { jogoId: string; jogadorId: string; assistenciaId?: string | null; minuto?: number | null }): Promise<GoalSummary>;
  list(): Promise<GoalSummary[]>;
}

export class PrismaGolRepository implements GolRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async resolveGoalCommandContext(input: { groupId?: string; playerName: string }) {
    if (!input.groupId) {
      return null;
    }

    const turma = await this.prisma.turma.findFirst({
      where: { whatsappGroupId: input.groupId },
      include: {
        jogos: {
          where: {
            status: {
              in: ["CONFIRMACAO_ABERTA", "FECHADO", "TIMES_GERADOS", "FINALIZADO"],
            },
          },
          orderBy: { dataJogo: "desc" },
          take: 1,
        },
        jogadores: {
          where: { ativo: true },
          orderBy: { nome: "asc" },
        },
      },
    });

    const jogo = turma?.jogos[0];
    if (!turma || !jogo) {
      return null;
    }

    const normalizedTarget = normalizeName(input.playerName);
    const jogador =
      turma.jogadores.find((item) => normalizeName(item.nome) === normalizedTarget) ??
      turma.jogadores.find((item) => normalizeName(item.nome).includes(normalizedTarget));

    if (!jogador) {
      return null;
    }

    return {
      jogoId: jogo.id,
      turmaId: turma.id,
      turmaNome: turma.nome,
      jogadorId: jogador.id,
      jogadorNome: jogador.nome,
    };
  }

  async create(input: { jogoId: string; jogadorId: string; assistenciaId?: string | null; minuto?: number | null }) {
    const goal = await this.prisma.gol.create({
      data: {
        jogoId: input.jogoId,
        jogadorId: input.jogadorId,
        assistenciaId: input.assistenciaId ?? null,
        minuto: input.minuto ?? null,
      },
      include: {
        jogador: { include: { turma: true } },
        assistencia: true,
      },
    });

    return {
      id: goal.id,
      jogoId: goal.jogoId,
      jogadorId: goal.jogadorId,
      jogadorNome: goal.jogador.nome,
      turmaId: goal.jogador.turmaId,
      turmaNome: goal.jogador.turma.nome,
      assistenciaId: goal.assistenciaId,
      assistenciaNome: goal.assistencia?.nome ?? null,
      minuto: goal.minuto,
      createdAt: goal.createdAt.toISOString(),
    };
  }

  async list() {
    const goals = await this.prisma.gol.findMany({
      include: {
        jogador: { include: { turma: true } },
        assistencia: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return goals.map((goal) => ({
      id: goal.id,
      jogoId: goal.jogoId,
      jogadorId: goal.jogadorId,
      jogadorNome: goal.jogador.nome,
      turmaId: goal.jogador.turmaId,
      turmaNome: goal.jogador.turma.nome,
      assistenciaId: goal.assistenciaId,
      assistenciaNome: goal.assistencia?.nome ?? null,
      minuto: goal.minuto,
      createdAt: goal.createdAt.toISOString(),
    }));
  }
}
