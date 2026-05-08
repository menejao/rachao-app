import type { PrismaClient } from "@prisma/client";
import type { WhatsAppProvider } from "@rachao/types";

export interface PresenceDispatchContext {
  turmaId: string;
  turmaNome: string;
  whatsappGroupId: string | null;
  whatsappProvider: WhatsAppProvider;
  jogadores: Array<{ id: string; nome: string; telefone: string }>;
}

export interface PresenceWebhookContext {
  jogoId: string;
  turmaId: string;
  playerId: string;
  playerName: string;
  command?: "/times";
}

export interface PresencaRepository {
  getDispatchContext(turmaId: string): Promise<PresenceDispatchContext | null>;
  createOrOpenGame(input: { turmaId: string; dataJogo: Date }): Promise<{ id: string; dataJogo: Date }>;
  upsertPendingPresencas(input: { jogoId: string; jogadorIds: string[] }): Promise<void>;
  resolveWebhookContext(input: {
    groupId?: string;
    fromPhone: string;
  }): Promise<PresenceWebhookContext | null>;
  resolveTimesCommandContext(input: { groupId?: string }): Promise<{ jogoId: string; turmaId: string } | null>;
  savePresenceResponse(input: {
    jogoId: string;
    playerId: string;
    resposta: "SIM" | "NAO";
  }): Promise<void>;
  listForStats(): Promise<Array<{ jogadorId: string; resposta: "SIM" | "NAO" | "PENDENTE" }>>;
}

export class PrismaPresencaRepository implements PresencaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getDispatchContext(turmaId: string) {
    const turma = await this.prisma.turma.findUnique({
      where: { id: turmaId },
      include: {
        jogadores: {
          where: { ativo: true },
          orderBy: { nome: "asc" },
        },
      },
    });

    if (!turma) return null;

    return {
      turmaId: turma.id,
      turmaNome: turma.nome,
      whatsappGroupId: turma.whatsappGroupId,
      whatsappProvider: (turma.whatsappProvider as WhatsAppProvider | null) ?? "mock",
      jogadores: turma.jogadores.map((jogador) => ({
        id: jogador.id,
        nome: jogador.nome,
        telefone: jogador.telefone,
      })),
    };
  }

  async createOrOpenGame(input: { turmaId: string; dataJogo: Date }) {
    const existing = await this.prisma.jogo.findFirst({
      where: {
        turmaId: input.turmaId,
        dataJogo: input.dataJogo,
      },
    });

    if (existing) {
      if (existing.status !== "CONFIRMACAO_ABERTA") {
        await this.prisma.jogo.update({
          where: { id: existing.id },
          data: { status: "CONFIRMACAO_ABERTA" },
        });
      }
      return { id: existing.id, dataJogo: existing.dataJogo };
    }

    const created = await this.prisma.jogo.create({
      data: {
        turmaId: input.turmaId,
        dataJogo: input.dataJogo,
        status: "CONFIRMACAO_ABERTA",
      },
    });

    return { id: created.id, dataJogo: created.dataJogo };
  }

  async upsertPendingPresencas(input: { jogoId: string; jogadorIds: string[] }) {
    await Promise.all(
      input.jogadorIds.map((jogadorId) =>
        this.prisma.presenca.upsert({
          where: {
            jogoId_jogadorId: {
              jogoId: input.jogoId,
              jogadorId,
            },
          },
          update: {},
          create: {
            jogoId: input.jogoId,
            jogadorId,
            resposta: "PENDENTE",
          },
        })
      )
    );
  }

  async resolveWebhookContext(input: { groupId?: string; fromPhone: string }) {
    const player = await this.prisma.jogador.findFirst({
      where: {
        telefone: input.fromPhone,
        turma: input.groupId ? { whatsappGroupId: input.groupId } : undefined,
      },
      include: {
        turma: {
          include: {
            jogos: {
              where: { status: "CONFIRMACAO_ABERTA" },
              orderBy: { dataJogo: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    const game = player?.turma.jogos[0];
    if (!player || !game) return null;

    return {
      jogoId: game.id,
      turmaId: player.turmaId,
      playerId: player.id,
      playerName: player.nome,
    };
  }

  async resolveTimesCommandContext(input: { groupId?: string }) {
    if (!input.groupId) return null;

    const turma = await this.prisma.turma.findFirst({
      where: { whatsappGroupId: input.groupId },
      include: {
        jogos: {
          where: {
            status: {
              in: ["CONFIRMACAO_ABERTA", "FECHADO", "TIMES_GERADOS"],
            },
          },
          orderBy: { dataJogo: "desc" },
          take: 1,
        },
      },
    });

    const jogo = turma?.jogos[0];
    if (!turma || !jogo) return null;

    return {
      jogoId: jogo.id,
      turmaId: turma.id,
    };
  }

  async savePresenceResponse(input: {
    jogoId: string;
    playerId: string;
    resposta: "SIM" | "NAO";
  }) {
    await this.prisma.presenca.upsert({
      where: {
        jogoId_jogadorId: {
          jogoId: input.jogoId,
          jogadorId: input.playerId,
        },
      },
      update: {
        resposta: input.resposta,
        respondeuEm: new Date(),
      },
      create: {
        jogoId: input.jogoId,
        jogadorId: input.playerId,
        resposta: input.resposta,
        respondeuEm: new Date(),
      },
    });
  }

  async listForStats() {
    const presencas = await this.prisma.presenca.findMany({
      select: {
        jogadorId: true,
        resposta: true,
      },
    });

    return presencas;
  }
}
