"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresencaService = void 0;
const utils_1 = require("@rachao/utils");
const whatsapp_provider_1 = require("../whatsapp/whatsapp.provider");
class PresencaService {
    repository;
    logRepository;
    timeService;
    golService;
    constructor(repository, logRepository, timeService, golService) {
        this.repository = repository;
        this.logRepository = logRepository;
        this.timeService = timeService;
        this.golService = golService;
    }
    async dispatchPresenceRequest(input) {
        const context = await this.repository.getDispatchContext(input.turmaId);
        if (!context) {
            throw new Error("Turma não encontrada");
        }
        if (!context.whatsappGroupId) {
            throw new Error("Turma sem whatsappGroupId configurado");
        }
        const game = await this.repository.createOrOpenGame({
            turmaId: input.turmaId,
            dataJogo: new Date(input.dataJogo),
        });
        await this.repository.upsertPendingPresencas({
            jogoId: game.id,
            jogadorIds: context.jogadores.map((item) => item.id),
        });
        const sender = (0, whatsapp_provider_1.makeWhatsAppSender)(context.whatsappProvider);
        const message = input.message ??
            (0, utils_1.buildPresenceMessage)({
                turmaNome: context.turmaNome,
                dataJogo: input.dataJogo,
            });
        const dispatch = await sender.sendGroupMessage({
            provider: context.whatsappProvider,
            groupId: context.whatsappGroupId,
            message,
        });
        await this.logRepository.create({
            tipo: "presence.dispatch",
            origem: context.whatsappProvider,
            turmaId: context.turmaId,
            jogoId: game.id,
            payload: {
                groupId: context.whatsappGroupId,
                playerCount: context.jogadores.length,
                providerMessageId: dispatch.providerMessageId,
                deliveryMode: dispatch.mode,
                message,
            },
        });
        return {
            ok: true,
            jogoId: game.id,
            provider: context.whatsappProvider,
            providerMessageId: dispatch.providerMessageId,
            playerCount: context.jogadores.length,
            mocked: dispatch.echoed,
            deliveryMode: dispatch.mode,
        };
    }
    async receivePresenceWebhook(input) {
        const normalizedMessage = input.message.trim().toLowerCase();
        if (normalizedMessage === "/times") {
            const commandContext = await this.repository.resolveTimesCommandContext({
                groupId: input.groupId,
            });
            if (!commandContext) {
                return {
                    ok: false,
                    ignored: true,
                    reason: "Jogo aberto não encontrado para /times",
                };
            }
            const teams = await this.timeService.generate(commandContext.jogoId);
            await this.logRepository.create({
                tipo: "teams.regenerated.command",
                origem: input.provider,
                turmaId: commandContext.turmaId,
                jogoId: commandContext.jogoId,
                payload: {
                    command: "/times",
                    teamCount: teams.length,
                },
            });
            return {
                ok: true,
                command: "/times",
                jogoId: commandContext.jogoId,
                teams,
            };
        }
        if ((0, utils_1.parseGoalCommand)(input.message)) {
            return this.golService.registerFromCommand({
                provider: input.provider,
                groupId: input.groupId,
                message: input.message,
            });
        }
        const resposta = (0, utils_1.parsePresenceResponse)(input.message);
        await this.logRepository.create({
            tipo: "presence.webhook.received",
            origem: input.provider,
            payload: input,
        });
        if (!resposta) {
            return {
                ok: false,
                ignored: true,
                reason: "Mensagem não reconhecida",
            };
        }
        if (resposta === "PENDENTE") {
            return {
                ok: false,
                ignored: true,
                reason: "Resposta pendente não deve ser persistida",
            };
        }
        const context = await this.repository.resolveWebhookContext({
            groupId: input.groupId,
            fromPhone: (0, utils_1.normalizePhone)(input.fromPhone),
        });
        if (!context) {
            await this.logRepository.create({
                tipo: "presence.webhook.unmatched",
                origem: input.provider,
                payload: input,
            });
            return {
                ok: false,
                ignored: true,
                reason: "Jogador ou jogo aberto não encontrado",
            };
        }
        await this.repository.savePresenceResponse({
            jogoId: context.jogoId,
            playerId: context.playerId,
            resposta,
        });
        await this.logRepository.create({
            tipo: "presence.response.saved",
            origem: input.provider,
            turmaId: context.turmaId,
            jogoId: context.jogoId,
            jogadorId: context.playerId,
            payload: {
                playerName: context.playerName,
                resposta,
            },
        });
        return {
            ok: true,
            jogoId: context.jogoId,
            jogadorId: context.playerId,
            resposta,
        };
    }
}
exports.PresencaService = PresencaService;
