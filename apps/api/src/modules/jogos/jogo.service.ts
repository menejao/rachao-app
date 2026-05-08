import type { PrismaClient } from "@prisma/client";
import { demoStore } from "../../mocks/demo-store";

export interface CreateJogoInput {
  turmaId: string;
  dataJogo: string;
  observacoes?: string;
}

export interface JogoBasic {
  id: string;
  turmaId: string;
  turmaNome: string;
  dataJogo: string;
  status: string;
  confirmados: number;
  recusados: number;
  pendentes: number;
}

export class JogoService {
  constructor(
    private readonly options: { useMock: boolean; prisma?: PrismaClient }
  ) {}

  async create(input: CreateJogoInput): Promise<JogoBasic> {
    if (this.options.useMock) {
      const turma = demoStore.turmas.find((t) => t.id === input.turmaId);
      if (!turma) throw new Error("Turma não encontrada");
      const jogo = {
        id: `g-demo-${demoStore.jogos.length + 1}`,
        turmaId: input.turmaId,
        dataJogo: input.dataJogo.slice(0, 10),
        status: "RASCUNHO" as const,
      };
      demoStore.jogos.push(jogo);
      return {
        ...jogo,
        turmaNome: turma.nome,
        confirmados: 0,
        recusados: 0,
        pendentes: 0,
      };
    }

    const prisma = this.options.prisma!;
    const jogo = await prisma.jogo.create({
      data: {
        turmaId: input.turmaId,
        dataJogo: new Date(input.dataJogo),
        observacoes: input.observacoes,
      },
      include: { turma: { select: { nome: true } } },
    });

    return {
      id: jogo.id,
      turmaId: jogo.turmaId,
      turmaNome: jogo.turma.nome,
      dataJogo: jogo.dataJogo.toISOString(),
      status: jogo.status,
      confirmados: 0,
      recusados: 0,
      pendentes: 0,
    };
  }
}
