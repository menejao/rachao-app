"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockJobRepository = exports.PrismaJobRepository = void 0;
const demo_store_1 = require("../../mocks/demo-store");
class PrismaJobRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
            whatsappProvider: turma.whatsappProvider ?? "mock",
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
            groupId: jogo.turma.whatsappGroupId,
            provider: jogo.turma.whatsappProvider ?? "mock",
            pendingPlayers: jogo.presencas.map((item) => item.jogador.nome),
        }));
    }
    async listGamesByStatuses(statuses) {
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
            status: jogo.status,
            groupId: jogo.turma.whatsappGroupId ?? null,
            provider: jogo.turma.whatsappProvider ?? "mock",
            confirmedCount: jogo.presencas.length,
        }));
    }
    async updateGameStatus(jogoId, status) {
        await this.prisma.jogo.update({
            where: { id: jogoId },
            data: { status },
        });
    }
}
exports.PrismaJobRepository = PrismaJobRepository;
class MockJobRepository {
    async listScheduledTurmas() {
        return demo_store_1.demoStore.turmas.map((turma) => ({
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
        return demo_store_1.demoStore.jogos
            .filter((jogo) => jogo.status === "CONFIRMACAO_ABERTA")
            .map((jogo) => {
            const turma = demo_store_1.demoStore.turmas.find((item) => item.id === jogo.turmaId);
            const pendingPlayers = demo_store_1.demoStore.presencas
                .filter((item) => item.jogoId === jogo.id && item.resposta === "PENDENTE")
                .map((item) => demo_store_1.demoStore.jogadores.find((player) => player.id === item.jogadorId)?.nome ?? "Jogador");
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
            .filter(Boolean);
    }
    async listGamesByStatuses(statuses) {
        return demo_store_1.demoStore.jogos
            .filter((jogo) => statuses.includes(jogo.status))
            .map((jogo) => {
            const turma = demo_store_1.demoStore.turmas.find((item) => item.id === jogo.turmaId);
            const confirmedCount = demo_store_1.demoStore.presencas.filter((item) => item.jogoId === jogo.id && item.resposta === "SIM").length;
            return {
                jogoId: jogo.id,
                turmaId: jogo.turmaId,
                turmaNome: turma?.nome ?? "Turma",
                status: jogo.status,
                groupId: turma?.whatsappGroupId ?? null,
                provider: turma?.whatsappProvider ?? "mock",
                confirmedCount,
            };
        });
    }
    async updateGameStatus(jogoId, status) {
        const jogo = demo_store_1.demoStore.jogos.find((item) => item.id === jogoId);
        if (jogo) {
            jogo.status = status;
        }
    }
}
exports.MockJobRepository = MockJobRepository;
