"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const demo_store_1 = require("../../mocks/demo-store");
const pagamento_service_1 = require("../pagamentos/pagamento.service");
class DashboardService {
    input;
    pagamentoService;
    constructor(input) {
        this.input = input;
        this.pagamentoService = new pagamento_service_1.PagamentoService(input.pagamentoRepository, input.turmaRepository, input.jogadorRepository, { create: async () => undefined, list: async () => [] });
    }
    async getData() {
        const [turmas, jogadores, financeiro, extras, estatisticas] = await Promise.all([
            this.input.turmaRepository.list(),
            this.input.jogadorRepository.list(),
            this.pagamentoService.getResumo(),
            this.input.useMockData ? this.getMockExtras() : this.getPrismaExtras(),
            this.input.estatisticaService.getResumo(),
        ]);
        return {
            turmas,
            jogadores,
            financeiro,
            jogos: extras.jogos,
            presencas: extras.presencas,
            timesGerados: extras.timesGerados,
            estatisticas,
        };
    }
    async getMockExtras() {
        const jogos = demo_store_1.demoStore.jogos.map((jogo) => {
            const turma = demo_store_1.demoStore.turmas.find((item) => item.id === jogo.turmaId);
            const presencas = demo_store_1.demoStore.presencas.filter((item) => item.jogoId === jogo.id);
            return {
                id: jogo.id,
                turmaId: jogo.turmaId,
                turmaNome: turma?.nome ?? "Turma",
                dataJogo: jogo.dataJogo,
                status: jogo.status,
                confirmados: presencas.filter((item) => item.resposta === "SIM").length,
                recusados: presencas.filter((item) => item.resposta === "NAO").length,
                pendentes: presencas.filter((item) => item.resposta === "PENDENTE").length,
            };
        });
        const presencas = demo_store_1.demoStore.presencas.map((presence) => {
            const jogador = demo_store_1.demoStore.jogadores.find((item) => item.id === presence.jogadorId);
            const jogo = demo_store_1.demoStore.jogos.find((item) => item.id === presence.jogoId);
            const turma = demo_store_1.demoStore.turmas.find((item) => item.id === jogo?.turmaId);
            const time = demo_store_1.demoStore.times.find((item) => item.id === presence.timeId);
            return {
                id: presence.id,
                jogoId: presence.jogoId,
                jogadorId: presence.jogadorId,
                jogadorNome: jogador?.nome ?? "Jogador",
                turmaNome: turma?.nome ?? "Turma",
                resposta: presence.resposta,
                timeNome: time?.nome ?? null,
            };
        });
        return {
            jogos,
            presencas,
            timesGerados: (0, demo_store_1.mapTimeSummaries)(),
        };
    }
    async getPrismaExtras() {
        if (!this.input.prisma) {
            return {
                jogos: [],
                presencas: [],
                timesGerados: [],
            };
        }
        const [jogosRows, presencasRows, timesRows] = await Promise.all([
            this.input.prisma.jogo.findMany({
                include: {
                    turma: true,
                    presencas: true,
                },
                orderBy: { dataJogo: "desc" },
            }),
            this.input.prisma.presenca.findMany({
                include: {
                    jogador: true,
                    jogo: { include: { turma: true } },
                    time: true,
                },
                orderBy: { createdAt: "desc" },
            }),
            this.input.prisma.time.findMany({
                include: {
                    jogo: { include: { turma: true } },
                    presencas: { include: { jogador: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
        ]);
        return {
            jogos: jogosRows.map((jogo) => ({
                id: jogo.id,
                turmaId: jogo.turmaId,
                turmaNome: jogo.turma.nome,
                dataJogo: jogo.dataJogo.toISOString(),
                status: jogo.status,
                confirmados: jogo.presencas.filter((item) => item.resposta === "SIM").length,
                recusados: jogo.presencas.filter((item) => item.resposta === "NAO").length,
                pendentes: jogo.presencas.filter((item) => item.resposta === "PENDENTE").length,
            })),
            presencas: presencasRows.map((item) => ({
                id: item.id,
                jogoId: item.jogoId,
                jogadorId: item.jogadorId,
                jogadorNome: item.jogador.nome,
                turmaNome: item.jogo.turma.nome,
                resposta: item.resposta,
                timeNome: item.time?.nome ?? null,
            })),
            timesGerados: timesRows.map((team) => ({
                id: team.id,
                jogoId: team.jogoId,
                turmaNome: team.jogo.turma.nome,
                nome: team.nome,
                cor: team.cor,
                nivelMedio: Number(team.nivelMedio ?? 0),
                jogadores: team.presencas.map((presence) => presence.jogador.nome),
            })),
        };
    }
}
exports.DashboardService = DashboardService;
