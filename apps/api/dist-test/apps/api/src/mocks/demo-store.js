"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoStore = void 0;
exports.addDemoLog = addDemoLog;
exports.mapConfirmedPlayersForGame = mapConfirmedPlayersForGame;
exports.mapTimeSummaries = mapTimeSummaries;
exports.demoStore = {
    turmas: [
        {
            id: "turma-demo-1",
            nome: "Racha Quarta",
            local: "Arena Vila",
            diaSemana: 3,
            horario: "20:00",
            mensalidade: 80,
            status: "ATIVA",
            totalJogadores: 10,
            whatsappGroupId: "grupo-quadra",
            whatsappProvider: "mock",
        },
    ],
    jogadores: [
        { id: "j1", turmaId: "turma-demo-1", nome: "Leo", telefone: "5511999991001", posicao: "GOLEIRO", nivel: 5, ativo: true },
        { id: "j2", turmaId: "turma-demo-1", nome: "Beto", telefone: "5511999991002", posicao: "GOLEIRO", nivel: 4, ativo: true },
        { id: "j3", turmaId: "turma-demo-1", nome: "Rafa", telefone: "5511999991003", posicao: "FIXO", nivel: 5, ativo: true },
        { id: "j4", turmaId: "turma-demo-1", nome: "Iago", telefone: "5511999991004", posicao: "FIXO", nivel: 3, ativo: true },
        { id: "j5", turmaId: "turma-demo-1", nome: "Nando", telefone: "5511999991005", posicao: "ALA", nivel: 5, ativo: true },
        { id: "j6", turmaId: "turma-demo-1", nome: "Gui", telefone: "5511999991006", posicao: "ALA", nivel: 4, ativo: true },
        { id: "j7", turmaId: "turma-demo-1", nome: "Digo", telefone: "5511999991007", posicao: "ALA", nivel: 3, ativo: true },
        { id: "j8", turmaId: "turma-demo-1", nome: "Pablo", telefone: "5511999991008", posicao: "PIVO", nivel: 4, ativo: true },
        { id: "j9", turmaId: "turma-demo-1", nome: "Cadu", telefone: "5511999991009", posicao: "PIVO", nivel: 2, ativo: true },
        { id: "j10", turmaId: "turma-demo-1", nome: "Teo", telefone: "5511999991010", posicao: "CORINGA", nivel: 4, ativo: true },
    ],
    jogos: [
        {
            id: "g-demo-1",
            turmaId: "turma-demo-1",
            dataJogo: "2026-05-14",
            status: "CONFIRMACAO_ABERTA",
        },
    ],
    presencas: [
        { id: "p1", jogoId: "g-demo-1", jogadorId: "j1", resposta: "SIM", timeId: null },
        { id: "p2", jogoId: "g-demo-1", jogadorId: "j2", resposta: "SIM", timeId: null },
        { id: "p3", jogoId: "g-demo-1", jogadorId: "j3", resposta: "SIM", timeId: null },
        { id: "p4", jogoId: "g-demo-1", jogadorId: "j4", resposta: "SIM", timeId: null },
        { id: "p5", jogoId: "g-demo-1", jogadorId: "j5", resposta: "SIM", timeId: null },
        { id: "p6", jogoId: "g-demo-1", jogadorId: "j6", resposta: "SIM", timeId: null },
        { id: "p7", jogoId: "g-demo-1", jogadorId: "j7", resposta: "NAO", timeId: null },
        { id: "p8", jogoId: "g-demo-1", jogadorId: "j8", resposta: "SIM", timeId: null },
        { id: "p9", jogoId: "g-demo-1", jogadorId: "j9", resposta: "SIM", timeId: null },
        { id: "p10", jogoId: "g-demo-1", jogadorId: "j10", resposta: "PENDENTE", timeId: null },
    ],
    times: [],
    gols: [
        {
            id: "gol-1",
            jogoId: "g-demo-1",
            jogadorId: "j5",
            jogadorNome: "Nando",
            turmaId: "turma-demo-1",
            turmaNome: "Racha Quarta",
            assistenciaId: null,
            assistenciaNome: null,
            minuto: 12,
            createdAt: "2026-05-14T20:30:00.000Z",
        },
        {
            id: "gol-2",
            jogoId: "g-demo-1",
            jogadorId: "j3",
            jogadorNome: "Rafa",
            turmaId: "turma-demo-1",
            turmaNome: "Racha Quarta",
            assistenciaId: null,
            assistenciaNome: null,
            minuto: 18,
            createdAt: "2026-05-14T20:36:00.000Z",
        },
        {
            id: "gol-3",
            jogoId: "g-demo-1",
            jogadorId: "j5",
            jogadorNome: "Nando",
            turmaId: "turma-demo-1",
            turmaNome: "Racha Quarta",
            assistenciaId: null,
            assistenciaNome: null,
            minuto: 27,
            createdAt: "2026-05-14T20:45:00.000Z",
        },
    ],
    pagamentos: [
        {
            id: "pg1",
            turmaId: "turma-demo-1",
            jogadorId: "j1",
            jogadorNome: "Leo",
            referenciaMes: 5,
            referenciaAno: 2026,
            valor: 80,
            status: "PAGO",
            pagoEm: "2026-05-02T12:00:00.000Z",
        },
        {
            id: "pg2",
            turmaId: "turma-demo-1",
            jogadorId: "j2",
            jogadorNome: "Beto",
            referenciaMes: 5,
            referenciaAno: 2026,
            valor: 80,
            status: "ATRASADO",
            pagoEm: null,
        },
        {
            id: "pg3",
            turmaId: "turma-demo-1",
            jogadorId: "j3",
            jogadorNome: "Rafa",
            referenciaMes: 5,
            referenciaAno: 2026,
            valor: 80,
            status: "PENDENTE",
            pagoEm: null,
        },
    ],
    logs: [],
};
function addDemoLog(entry) {
    exports.demoStore.logs.unshift({
        id: `log-${exports.demoStore.logs.length + 1}`,
        createdAt: new Date().toISOString(),
        ...entry,
    });
}
function mapConfirmedPlayersForGame(jogoId) {
    return exports.demoStore.presencas
        .filter((presence) => presence.jogoId === jogoId && presence.resposta === "SIM")
        .map((presence) => exports.demoStore.jogadores.find((player) => player.id === presence.jogadorId))
        .filter(Boolean)
        .map((player) => ({
        id: player.id,
        nome: player.nome,
        posicao: player.posicao,
        nivel: player.nivel,
    }));
}
function mapTimeSummaries() {
    return exports.demoStore.times.map((team) => {
        const jogo = exports.demoStore.jogos.find((item) => item.id === team.jogoId);
        const turma = exports.demoStore.turmas.find((item) => item.id === jogo?.turmaId);
        return {
            id: team.id,
            jogoId: team.jogoId,
            turmaNome: turma?.nome ?? "Turma",
            nome: team.nome,
            cor: team.cor ?? null,
            nivelMedio: team.nivelMedio,
            jogadores: team.jogadores.map((item) => item.nome),
        };
    });
}
