"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GolService = void 0;
const utils_1 = require("@rachao/utils");
class GolService {
    repository;
    logRepository;
    constructor(repository, logRepository) {
        this.repository = repository;
        this.logRepository = logRepository;
    }
    async registerFromCommand(input) {
        const parsed = (0, utils_1.parseGoalCommand)(input.message);
        if (!parsed) {
            return {
                ok: false,
                ignored: true,
                reason: "Comando de gol invalido",
            };
        }
        const context = await this.repository.resolveGoalCommandContext({
            groupId: input.groupId,
            playerName: parsed.playerName,
        });
        if (!context) {
            return {
                ok: false,
                ignored: true,
                reason: "Jogador ou jogo nao encontrado para /gol",
            };
        }
        const goal = await this.repository.create({
            jogoId: context.jogoId,
            jogadorId: context.jogadorId,
        });
        await this.logRepository.create({
            tipo: "goal.registered.command",
            origem: input.provider,
            turmaId: context.turmaId,
            jogoId: context.jogoId,
            jogadorId: context.jogadorId,
            payload: {
                command: "/gol",
                playerName: context.jogadorNome,
            },
        });
        return {
            ok: true,
            command: "/gol",
            goal,
        };
    }
}
exports.GolService = GolService;
