import type { PrismaClient } from "@prisma/client";
import type { EventoLogEntry } from "@rachao/types";

export interface LogRepository {
  create(input: {
    tipo: string;
    origem: string;
    turmaId?: string | null;
    jogoId?: string | null;
    jogadorId?: string | null;
    payload?: unknown;
  }): Promise<void>;
  list(filters: { turmaId?: string; jogoId?: string; limit: number }): Promise<EventoLogEntry[]>;
}

export class PrismaLogRepository implements LogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: {
    tipo: string;
    origem: string;
    turmaId?: string | null;
    jogoId?: string | null;
    jogadorId?: string | null;
    payload?: unknown;
  }) {
    await this.prisma.eventoLog.create({
      data: {
        tipo: input.tipo,
        origem: input.origem,
        turmaId: input.turmaId,
        jogoId: input.jogoId,
        jogadorId: input.jogadorId,
        payload: input.payload as never,
      },
    });
  }

  async list(filters: { turmaId?: string; jogoId?: string; limit: number }) {
    const rows = await this.prisma.eventoLog.findMany({
      where: {
        turmaId: filters.turmaId,
        jogoId: filters.jogoId,
      },
      orderBy: { createdAt: "desc" },
      take: filters.limit,
    });

    return rows.map((row: (typeof rows)[number]) => ({
      id: row.id,
      tipo: row.tipo,
      origem: row.origem,
      turmaId: row.turmaId,
      jogoId: row.jogoId,
      jogadorId: row.jogadorId,
      payload: row.payload,
      createdAt: row.createdAt.toISOString(),
    }));
  }
}
