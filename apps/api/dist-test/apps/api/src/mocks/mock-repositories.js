"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockGolRepository = exports.MockPagamentoRepository = exports.MockTimeRepository = exports.MockPresencaRepository = exports.MockLogRepository = exports.MockJogadorRepository = exports.MockTurmaRepository = void 0;
const utils_1 = require("@rachao/utils");
const demo_store_1 = require("./demo-store");
class MockTurmaRepository {
    async list(filters) {
        void filters;
        return demo_store_1.demoStore.turmas.map((item) => ({ ...item }));
    }
    async create(input) {
        const turma = {
            id: `turma-demo-${demo_store_1.demoStore.turmas.length + 1}`,
            nome: input.nome,
            local: input.local ?? null,
            diaSemana: input.diaSemana,
            horario: input.horario,
            mensalidade: input.mensalidade,
            status: "ATIVA",
            totalJogadores: 0,
            whatsappGroupId: input.whatsappGroupId,
            whatsappProvider: (input.whatsappProvider ?? "mock"),
        };
        demo_store_1.demoStore.turmas.unshift(turma);
        return turma;
    }
}
exports.MockTurmaRepository = MockTurmaRepository;
class MockJogadorRepository {
    async list(filters) {
        return demo_store_1.demoStore.jogadores.filter((item) => !filters?.turmaId || item.turmaId === filters.turmaId);
    }
    async create(input) {
        const jogador = {
            id: `j${demo_store_1.demoStore.jogadores.length + 1}`,
            turmaId: input.turmaId,
            nome: input.nome,
            telefone: (0, utils_1.normalizePhone)(input.telefone),
            email: input.email ?? null,
            posicao: input.posicao,
            nivel: input.nivel,
            ativo: true,
        };
        demo_store_1.demoStore.jogadores.push(jogador);
        const turma = demo_store_1.demoStore.turmas.find((item) => item.id === input.turmaId);
        if (turma)
            turma.totalJogadores = (turma.totalJogadores ?? 0) + 1;
        return jogador;
    }
}
exports.MockJogadorRepository = MockJogadorRepository;
class MockLogRepository {
    async create(input) {
        (0, demo_store_1.addDemoLog)(input);
    }
    async list(filters) {
        return demo_store_1.demoStore.logs
            .filter((entry) => (!filters.turmaId || entry.turmaId === filters.turmaId) && (!filters.jogoId || entry.jogoId === filters.jogoId))
            .slice(0, filters.limit);
    }
}
exports.MockLogRepository = MockLogRepository;
class MockPresencaRepository {
    async getDispatchContext(turmaId) {
        const turma = demo_store_1.demoStore.turmas.find((item) => item.id === turmaId);
        if (!turma)
            return null;
        return {
            turmaId: turma.id,
            turmaNome: turma.nome,
            whatsappGroupId: turma.whatsappGroupId ?? null,
            whatsappProvider: turma.whatsappProvider ?? "mock",
            jogadores: demo_store_1.demoStore.jogadores
                .filter((item) => item.turmaId === turmaId && item.ativo)
                .map((item) => ({ id: item.id, nome: item.nome, telefone: item.telefone })),
        };
    }
    async createOrOpenGame(input) {
        const iso = input.dataJogo.toISOString().slice(0, 10);
        const existing = demo_store_1.demoStore.jogos.find((item) => item.turmaId === input.turmaId && item.dataJogo === iso);
        if (existing) {
            existing.status = "CONFIRMACAO_ABERTA";
            return { id: existing.id, dataJogo: input.dataJogo };
        }
        const game = { id: `g-demo-${demo_store_1.demoStore.jogos.length + 1}`, turmaId: input.turmaId, dataJogo: iso, status: "CONFIRMACAO_ABERTA" };
        demo_store_1.demoStore.jogos.push(game);
        return { id: game.id, dataJogo: input.dataJogo };
    }
    async upsertPendingPresencas(input) {
        for (const jogadorId of input.jogadorIds) {
            const existing = demo_store_1.demoStore.presencas.find((item) => item.jogoId === input.jogoId && item.jogadorId === jogadorId);
            if (!existing) {
                demo_store_1.demoStore.presencas.push({
                    id: `p-${demo_store_1.demoStore.presencas.length + 1}`,
                    jogoId: input.jogoId,
                    jogadorId,
                    resposta: "PENDENTE",
                    timeId: null,
                });
            }
        }
    }
    async resolveWebhookContext(input) {
        const turma = demo_store_1.demoStore.turmas.find((item) => !input.groupId || item.whatsappGroupId === input.groupId);
        const player = demo_store_1.demoStore.jogadores.find((item) => item.telefone === input.fromPhone && (!turma || item.turmaId === turma.id));
        const game = demo_store_1.demoStore.jogos.find((item) => item.turmaId === player?.turmaId && item.status === "CONFIRMACAO_ABERTA");
        if (!player || !game)
            return null;
        return { jogoId: game.id, turmaId: player.turmaId, playerId: player.id, playerName: player.nome };
    }
    async resolveTimesCommandContext(input) {
        const turma = demo_store_1.demoStore.turmas.find((item) => !input.groupId || item.whatsappGroupId === input.groupId);
        const jogo = demo_store_1.demoStore.jogos.find((item) => item.turmaId === turma?.id);
        if (!turma || !jogo)
            return null;
        return { jogoId: jogo.id, turmaId: turma.id };
    }
    async savePresenceResponse(input) {
        const existing = demo_store_1.demoStore.presencas.find((item) => item.jogoId === input.jogoId && item.jogadorId === input.playerId);
        if (existing) {
            existing.resposta = input.resposta;
            return;
        }
        demo_store_1.demoStore.presencas.push({
            id: `p-${demo_store_1.demoStore.presencas.length + 1}`,
            jogoId: input.jogoId,
            jogadorId: input.playerId,
            resposta: input.resposta,
            timeId: null,
        });
    }
    async listForStats() {
        return demo_store_1.demoStore.presencas.map((item) => ({
            jogadorId: item.jogadorId,
            resposta: item.resposta,
        }));
    }
}
exports.MockPresencaRepository = MockPresencaRepository;
class MockTimeRepository {
    async getConfirmedPlayers(jogoId) {
        const jogo = demo_store_1.demoStore.jogos.find((item) => item.id === jogoId);
        if (!jogo)
            return null;
        return {
            jogoId,
            turmaId: jogo.turmaId,
            jogadores: (0, demo_store_1.mapConfirmedPlayersForGame)(jogoId),
        };
    }
    async replaceTeams(jogoId, teams) {
        demo_store_1.demoStore.times = demo_store_1.demoStore.times.filter((item) => !item.id.startsWith(`${jogoId}-`));
        demo_store_1.demoStore.presencas.forEach((presence) => {
            if (presence.jogoId === jogoId)
                presence.timeId = null;
        });
        return teams.map((team, index) => {
            const persisted = {
                id: `${jogoId}-team-${index + 1}`,
                jogoId,
                nome: team.nome,
                cor: team.cor,
                nivelMedio: team.nivelMedio,
                jogadores: team.jogadores,
            };
            demo_store_1.demoStore.times.push(persisted);
            for (const player of team.jogadores) {
                const presence = demo_store_1.demoStore.presencas.find((item) => item.jogoId === jogoId && item.jogadorId === player.id);
                if (presence)
                    presence.timeId = persisted.id;
            }
            return persisted;
        });
    }
}
exports.MockTimeRepository = MockTimeRepository;
class MockPagamentoRepository {
    async list(filters) {
        return demo_store_1.demoStore.pagamentos.filter((item) => (!filters?.turmaId || item.turmaId === filters.turmaId) &&
            (!filters?.referenciaMes || item.referenciaMes === filters.referenciaMes) &&
            (!filters?.referenciaAno || item.referenciaAno === filters.referenciaAno));
    }
    async create(input) {
        const jogador = demo_store_1.demoStore.jogadores.find((item) => item.id === input.jogadorId);
        const pagamento = {
            id: `pg${demo_store_1.demoStore.pagamentos.length + 1}`,
            turmaId: input.turmaId,
            jogadorId: input.jogadorId,
            jogadorNome: jogador?.nome ?? "Jogador",
            referenciaMes: input.referenciaMes,
            referenciaAno: input.referenciaAno,
            valor: input.valor,
            status: input.status ?? "PENDENTE",
            pagoEm: input.status === "PAGO" ? new Date().toISOString() : null,
        };
        demo_store_1.demoStore.pagamentos.unshift(pagamento);
        return pagamento;
    }
    async update(id, input) {
        const pagamento = demo_store_1.demoStore.pagamentos.find((item) => item.id === id);
        if (!pagamento)
            throw new Error("Pagamento não encontrado");
        if (typeof input.valor === "number")
            pagamento.valor = input.valor;
        if (input.status) {
            pagamento.status = input.status;
            pagamento.pagoEm = input.status === "PAGO" ? new Date().toISOString() : null;
        }
        return pagamento;
    }
    async markAsPaid(id, pagoEm) {
        const pagamento = demo_store_1.demoStore.pagamentos.find((item) => item.id === id);
        if (!pagamento)
            throw new Error("Pagamento não encontrado");
        pagamento.status = "PAGO";
        pagamento.pagoEm = pagoEm ?? new Date().toISOString();
        return pagamento;
    }
    async delete(id) {
        demo_store_1.demoStore.pagamentos = demo_store_1.demoStore.pagamentos.filter((item) => item.id !== id);
    }
}
exports.MockPagamentoRepository = MockPagamentoRepository;
class MockGolRepository {
    async resolveGoalCommandContext(input) {
        const turma = demo_store_1.demoStore.turmas.find((item) => !input.groupId || item.whatsappGroupId === input.groupId);
        const jogo = demo_store_1.demoStore.jogos.find((item) => item.turmaId === turma?.id);
        const normalizedTarget = (0, utils_1.normalizeName)(input.playerName);
        const jogador = demo_store_1.demoStore.jogadores.find((item) => item.turmaId === turma?.id &&
            ((0, utils_1.normalizeName)(item.nome) === normalizedTarget || (0, utils_1.normalizeName)(item.nome).includes(normalizedTarget)));
        if (!turma || !jogo || !jogador) {
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
        const jogador = demo_store_1.demoStore.jogadores.find((item) => item.id === input.jogadorId);
        const jogo = demo_store_1.demoStore.jogos.find((item) => item.id === input.jogoId);
        const turma = demo_store_1.demoStore.turmas.find((item) => item.id === jogo?.turmaId);
        if (!jogador || !jogo || !turma) {
            throw new Error("Contexto do gol nao encontrado");
        }
        const goal = {
            id: `gol-${demo_store_1.demoStore.gols.length + 1}`,
            jogoId: input.jogoId,
            jogadorId: input.jogadorId,
            jogadorNome: jogador.nome,
            turmaId: turma.id,
            turmaNome: turma.nome,
            assistenciaId: input.assistenciaId ?? null,
            assistenciaNome: null,
            minuto: input.minuto ?? null,
            createdAt: new Date().toISOString(),
        };
        demo_store_1.demoStore.gols.unshift(goal);
        return goal;
    }
    async list() {
        return demo_store_1.demoStore.gols.map((item) => ({ ...item }));
    }
}
exports.MockGolRepository = MockGolRepository;
