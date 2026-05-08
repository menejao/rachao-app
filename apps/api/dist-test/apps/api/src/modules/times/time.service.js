"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeService = void 0;
const utils_1 = require("@rachao/utils");
class TimeService {
    repository;
    logRepository;
    constructor(repository, logRepository) {
        this.repository = repository;
        this.logRepository = logRepository;
    }
    async generate(jogoId, teamCount) {
        const context = await this.repository.getConfirmedPlayers(jogoId);
        if (!context) {
            throw new Error("Jogo não encontrado");
        }
        if (context.jogadores.length < 2) {
            throw new Error("Jogadores confirmados insuficientes para gerar times");
        }
        const teams = (0, utils_1.generateBalancedTeams)(context.jogadores, teamCount);
        const persisted = await this.repository.replaceTeams(jogoId, teams);
        await this.logRepository.create({
            tipo: "teams.generated",
            origem: "system",
            turmaId: context.turmaId,
            jogoId,
            payload: {
                teamCount: persisted.length,
                players: context.jogadores.length,
            },
        });
        return persisted;
    }
}
exports.TimeService = TimeService;
