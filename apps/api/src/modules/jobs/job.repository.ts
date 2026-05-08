import type { PrismaClient } from "@prisma/client";
import type { WhatsAppProvider } from "@rachao/types";
import { demoStore } from "../../mocks/demo-store";

export interface ScheduledTurma {
  id: string;
  nome: string;
  diaSemana: number;
  horario: string;
  status: "ATIVA" | "INATIVA";
  whatsappGroupId: string | null;
  whatsappProvider: WhatsAppProvider;
}

export interface PendingReminderContext {
  jogoId: string;
  turmaId: string;
  turmaNome: string;
  dataJogo: string;
  groupId: string;
  provider: WhatsAppProvider;
  pendingPlayers: string[];
}

export interface JobGameContext {
  jogoId: string;
  turmaId: string;
  turmaNome: string;
  status: "CONFIRMACAO_ABERTA" | "FECHADO";
  groupId: string | null;
  provider: WhatsAppProvider;
  confirmedCount: number;
}

export interface JobRepository {
  listScheduledTurmas(): Promise<ScheduledTurmas[]>;
  listPendingReminders(): Promise<PendingReminderContext[]>;
  listGamesByStatuses(statuses: Array<"CONFIRMACAO_ABERTA" | "FECHADO">): Promise<JobGameContext[]>;
  updateGameStatus(jogoId: string, status: "FECHADO" | "TIMES_GERADOS"): Promise<void>;
}

type ScheduledTurmas = ScheduledTurma;

export class PrismaJobRepository implements JobRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listScheduledTurmas() {
    const turmas = await this.prisma.turma.findMany({
      where: { status: "ATIVA" },
      orderBy: { nome: "asc" },
    });

    return turmas.map((turma) => ({
      id: turma.id,
      nome: turma.nome,
      diaSemana: turma.diaSemana,
      horario: turma.horario,
      status: turma.status,
      whatsappGroupId: turma.whatsappGroupId,
      whatsappProvider: (turma.whatsappProvider as WhatsAppProvider | null) ?? "mock",
    }));
  }

  async listPendingReminders() {
    const jogos = await this.prisma.jogo.findMany({
      where: { status: "CONFIRMACAO_ABERTA" },
      include: {
        turma: true,
        presencas: {
          where: { resposta: "PENDENTE" },
          include: { jogador: true },
        },
      },
      orderBy: { dataJogo: "asc" },
    });

    return jogos
      .filter((jogo) => jogo.turma.whatsappGroupId && jogo.presencas.length > 0)
      .map((jogo) => ({
        jogoId: jogo.id,
        turmaId: jogo.turmaId,
        turmaNome: jogo.turma.nome,
        dataJogo: jogo.dataJogo.toISOString(),
        groupId: jogo.turma.whatsappGroupId!,
        provider: (jogo.turma.whatsappProvider as WhatsAppProvider | null) ?? "mock",
        pendingPlayers: jogo.presencas.map((item) => item.jogador.nome),
      }));
  }

  async listGamesByStatuses(statuses: Array<"CONFIRMACAO_ABERTA" | "FECHADO">) {
    const jogos = await this.prisma.jogo.findMany({
      where: { status: { in: statuses } },
      include: {
        turma: true,
        presencas: {
          where: { resposta: "SIM" },
          select: { id: true },
        },
      },
      orderBy: { dataJogo: "asc" },
    });

    return jogos.map((jogo) => ({
      jogoId: jogo.id,
      turmaId: jogo.turmaId,
      turmaNome: jogo.turma.nome,
      status: jogo.status as "CONFIRMACAO_ABERTA" | "FECHADO",
      groupId: jogo.turma.whatsappGroupId ?? null,
      provider: (jogo.turma.whatsappProvider as WhatsAppProvider | null) ?? "mock",
      confirmedCount: jogo.presencas.length,
    }));
  }

  async updateGameStatus(jogoId: string, status: "FECHADO" | "TIMES_GERADOS") {
    await this.prisma.jogo.update({
      where: { id: jogoId },
      data: { status },
    });
  }
}

export class MockJobRepository implements JobRepository {
  async listScheduledTurmas() {
    return demoStore.turmas.map((turma) => ({
      id: turma.id,
      nome: turma.nome,
      diaSemana: turma.diaSemana,
      horario: turma.horario,
      status: turma.status,
      whatsappGroupId: turma.whatsappGroupId ?? null,
      whatsappProvider: turma.whatsappProvider ?? "mock",
    }));
  }

  async listPendingReminders() {
    return demoStore.jogos
      .filter((jogo) => jogo.status === "CONFIRMACAO_ABERTA")
      .map((jogo) => {
        const turma = demoStore.turmas.find((item) => item.id === jogo.turmaId);
        const pendingPlayers = demoStore.presencas
          .filter((item) => item.jogoId === jogo.id && item.resposta === "PENDENTE")
          .map((item) => demoStore.jogadores.find((player) => player.id === item.jogadorId)?.nome ?? "Jogador");

        if (!turma?.whatsappGroupId || pendingPlayers.length === 0) {
          return null;
        }

        return {
          jogoId: jogo.id,
          turmaId: turma.id,
          turmaNome: turma.nome,
          dataJogo: jogo.dataJogo,
          groupId: turma.whatsappGroupId,
          provider: turma.whatsappProvider ?? "mock",
          pendingPlayers,
        };
      })
      .filter(Boolean) as PendingReminderContext[];
  }

  async listGamesByStatuses(statuses: Array<"CONFIRMACAO_ABERTA" | "FECHADO">) {
    return demoStore.jogos
      .filter((jogo) => statuses.includes(jogo.status as "CONFIRMACAO_ABERTA" | "FECHADO"))
      .map((jogo) => {
        const turma = demoStore.turmas.find((item) => item.id === jogo.turmaId);
        const confirmedCount = demoStore.presencas.filter(
          (item) => item.jogoId === jogo.id && item.resposta === "SIM"
        ).length;
        return {
          jogoId: jogo.id,
          turmaId: jogo.turmaId,
          turmaNome: turma?.nome ?? "Turma",
          status: jogo.status as "CONFIRMACAO_ABERTA" | "FECHADO",
          groupId: turma?.whatsappGroupId ?? null,
          provider: turma?.whatsappProvider ?? "mock",
          confirmedCount,
        };
      });
  }

  async updateGameStatus(jogoId: string, status: "FECHADO" | "TIMES_GERADOS") {
    const jogo = demoStore.jogos.find((item) => item.id === jogoId);
    if (jogo) {
      jogo.status = status;
    }
  }
}
