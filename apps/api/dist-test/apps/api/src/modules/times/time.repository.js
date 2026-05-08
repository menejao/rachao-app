"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTimeRepository = void 0;
class PrismaTimeRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConfirmedPlayers(jogoId) {
        const game = await this.prisma.jogo.findUnique({
            where: { id: jogoId },
            include: {
                presencas: {
                    where: { resposta: "SIM" },
                    include: { jogador: true },
                },
            },
        });
        if (!game)
            return null;
        return {
            jogoId: game.id,
            turmaId: game.turmaId,
            jogadores: game.presencas.map((presence) => ({
                id: presence.jogador.id,
                nome: presence.jogador.nome,
                posicao: presence.jogador.posicao,
                nivel: presence.jogador.nivel,
            })),
        };
    }
    async replaceTeams(jogoId, teams) {
        return this.prisma.$transaction(async (tx) => {
            await tx.presenca.updateMany({
                where: { jogoId },
                data: { timeId: null },
            });
            await tx.time.deleteMany({
                where: { jogoId },
            });
            const createdTeams = [];
            for (const team of teams) {
                const created = await tx.time.create({
                    data: {
                        jogoId,
                        nome: team.nome,
                        cor: team.cor,
                        nivelMedio: team.nivelMedio,
                    },
                });
                await tx.presenca.updateMany({
                    where: {
                        jogoId,
                        jogadorId: { in: team.jogadores.map((player) => player.id) },
                    },
                    data: {
                        timeId: created.id,
                    },
                });
                createdTeams.push({
                    id: created.id,
                    nome: created.nome,
                    cor: created.cor ?? undefined,
                    nivelMedio: Number(created.nivelMedio ?? 0),
                    jogadores: team.jogadores,
                });
            }
            await tx.jogo.update({
                where: { id: jogoId },
                data: { status: "TIMES_GERADOS" },
            });
            return createdTeams;
        });
    }
}
exports.PrismaTimeRepository = PrismaTimeRepository;
