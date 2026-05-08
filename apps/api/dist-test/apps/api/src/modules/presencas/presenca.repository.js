"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPresencaRepository = void 0;
class PrismaPresencaRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDispatchContext(turmaId) {
        const turma = await this.prisma.turma.findUnique({
            where: { id: turmaId },
            include: {
                jogadores: {
                    where: { ativo: true },
                    orderBy: { nome: "asc" },
                },
            },
        });
        if (!turma)
            return null;
        return {
            turmaId: turma.id,
            turmaNome: turma.nome,
            whatsappGroupId: turma.whatsappGroupId,
            whatsappProvider: turma.whatsappProvider ?? "mock",
            jogadores: turma.jogadores.map((jogador) => ({
                id: jogador.id,
                nome: jogador.nome,
                telefone: jogador.telefone,
            })),
        };
    }
    async createOrOpenGame(input) {
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
    async upsertPendingPresencas(input) {
        await Promise.all(input.jogadorIds.map((jogadorId) => this.prisma.presenca.upsert({
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
        })));
    }
    async resolveWebhookContext(input) {
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
        if (!player || !game)
            return null;
        return {
            jogoId: game.id,
            turmaId: player.turmaId,
            playerId: player.id,
            playerName: player.nome,
        };
    }
    async resolveTimesCommandContext(input) {
        if (!input.groupId)
            return null;
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
        if (!turma || !jogo)
            return null;
        return {
            jogoId: jogo.id,
            turmaId: turma.id,
        };
    }
    async savePresenceResponse(input) {
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
exports.PrismaPresencaRepository = PrismaPresencaRepository;
