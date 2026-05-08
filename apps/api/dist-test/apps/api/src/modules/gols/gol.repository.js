"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaGolRepository = void 0;
const utils_1 = require("@rachao/utils");
class PrismaGolRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveGoalCommandContext(input) {
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
        const normalizedTarget = (0, utils_1.normalizeName)(input.playerName);
        const jogador = turma.jogadores.find((item) => (0, utils_1.normalizeName)(item.nome) === normalizedTarget) ??
            turma.jogadores.find((item) => (0, utils_1.normalizeName)(item.nome).includes(normalizedTarget));
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
    async create(input) {
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
exports.PrismaGolRepository = PrismaGolRepository;
