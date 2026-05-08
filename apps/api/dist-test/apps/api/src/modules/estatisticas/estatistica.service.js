"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstatisticaService = void 0;
class EstatisticaService {
    golRepository;
    turmaRepository;
    jogadorRepository;
    presencaRepository;
    constructor(golRepository, turmaRepository, jogadorRepository, presencaRepository) {
        this.golRepository = golRepository;
        this.turmaRepository = turmaRepository;
        this.jogadorRepository = jogadorRepository;
        this.presencaRepository = presencaRepository;
    }
    async getResumo() {
        const [gols, turmas, jogadores, presencas] = await Promise.all([
            this.golRepository.list(),
            this.turmaRepository.list(),
            this.jogadorRepository.list(),
            this.presencaRepository.listForStats(),
        ]);
        const turmaMap = new Map(turmas.map((item) => [item.id, item.nome]));
        const jogadorMap = new Map(jogadores.map((item) => [
            item.id,
            { nome: item.nome, turmaId: item.turmaId, turmaNome: turmaMap.get(item.turmaId) ?? "Turma" },
        ]));
        return {
            gols,
            artilharia: buildRankingFromGoals(gols),
            presencaRanking: buildRankingFromPresencas(presencas, jogadorMap),
        };
    }
}
exports.EstatisticaService = EstatisticaService;
function buildRankingFromGoals(goals) {
    const score = new Map();
    for (const goal of goals) {
        const existing = score.get(goal.jogadorId) ?? {
            jogadorId: goal.jogadorId,
            jogadorNome: goal.jogadorNome,
            turmaId: goal.turmaId,
            turmaNome: goal.turmaNome,
            total: 0,
        };
        existing.total += 1;
        score.set(goal.jogadorId, existing);
    }
    return [...score.values()].sort(sortRanking);
}
function buildRankingFromPresencas(presencas, jogadorMap) {
    const score = new Map();
    for (const presenca of presencas) {
        if (presenca.resposta !== "SIM") {
            continue;
        }
        const jogador = jogadorMap.get(presenca.jogadorId);
        if (!jogador) {
            continue;
        }
        const existing = score.get(presenca.jogadorId) ?? {
            jogadorId: presenca.jogadorId,
            jogadorNome: jogador.nome,
            turmaId: jogador.turmaId,
            turmaNome: jogador.turmaNome,
            total: 0,
        };
        existing.total += 1;
        score.set(presenca.jogadorId, existing);
    }
    return [...score.values()].sort(sortRanking);
}
function sortRanking(left, right) {
    if (right.total !== left.total) {
        return right.total - left.total;
    }
    return left.jogadorNome.localeCompare(right.jogadorNome, "pt-BR");
}
