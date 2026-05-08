"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobService = void 0;
const utils_1 = require("@rachao/utils");
const whatsapp_provider_1 = require("../whatsapp/whatsapp.provider");
class JobService {
    repository;
    presencaService;
    timeService;
    logRepository;
    constructor(repository, presencaService, timeService, logRepository) {
        this.repository = repository;
        this.presencaService = presencaService;
        this.timeService = timeService;
        this.logRepository = logRepository;
    }
    async run(job, referenceDate = new Date()) {
        const startedAt = new Date().toISOString();
        try {
            let result;
            switch (job) {
                case "send_confirmation":
                    result = await this.sendConfirmation(referenceDate);
                    break;
                case "remind_pending":
                    result = await this.remindPending();
                    break;
                case "close_list":
                    result = await this.closeList();
                    break;
                case "generate_teams":
                    result = await this.generateTeams();
                    break;
            }
            await this.logRepository.create({
                tipo: "jobs.execution.success",
                origem: "scheduler",
                payload: {
                    job,
                    startedAt,
                    finishedAt: new Date().toISOString(),
                    ...result,
                },
            });
            return {
                ok: true,
                job,
                ...result,
            };
        }
        catch (error) {
            await this.logRepository.create({
                tipo: "jobs.execution.failed",
                origem: "scheduler",
                payload: {
                    job,
                    startedAt,
                    finishedAt: new Date().toISOString(),
                    error: error instanceof Error ? error.message : String(error),
                },
            });
            throw error;
        }
    }
    async sendConfirmation(referenceDate) {
        const turmas = await this.repository.listScheduledTurmas();
        const eligible = turmas.filter((turma) => turma.status === "ATIVA" && turma.whatsappGroupId);
        for (const turma of eligible) {
            const dataJogo = getNextOccurrence(referenceDate, turma.diaSemana, turma.horario);
            await this.presencaService.dispatchPresenceRequest({
                turmaId: turma.id,
                dataJogo: dataJogo.toISOString(),
            });
        }
        return {
            processed: eligible.length,
            turmas: eligible.map((item) => item.id),
        };
    }
    async remindPending() {
        const reminders = await this.repository.listPendingReminders();
        for (const item of reminders) {
            const sender = (0, whatsapp_provider_1.makeWhatsAppSender)(item.provider);
            const sent = await sender.sendGroupMessage({
                provider: item.provider,
                groupId: item.groupId,
                message: (0, utils_1.buildReminderMessage)({
                    turmaNome: item.turmaNome,
                    pendingPlayers: item.pendingPlayers,
                }),
            });
            await this.logRepository.create({
                tipo: "jobs.reminder.sent",
                origem: item.provider,
                turmaId: item.turmaId,
                jogoId: item.jogoId,
                payload: {
                    pendingPlayers: item.pendingPlayers,
                    providerMessageId: sent.providerMessageId,
                    deliveryMode: sent.mode,
                },
            });
        }
        return {
            processed: reminders.length,
            jogos: reminders.map((item) => item.jogoId),
        };
    }
    async closeList() {
        const jogos = await this.repository.listGamesByStatuses(["CONFIRMACAO_ABERTA"]);
        for (const jogo of jogos) {
            await this.repository.updateGameStatus(jogo.jogoId, "FECHADO");
            const sender = jogo.groupId ? (0, whatsapp_provider_1.makeWhatsAppSender)(jogo.provider) : null;
            if (sender && jogo.groupId) {
                await sender.sendGroupMessage({
                    provider: jogo.provider,
                    groupId: jogo.groupId,
                    message: (0, utils_1.buildListClosedMessage)({
                        turmaNome: jogo.turmaNome,
                        confirmedCount: jogo.confirmedCount,
                    }),
                });
            }
            await this.logRepository.create({
                tipo: "jobs.list.closed",
                origem: "scheduler",
                turmaId: jogo.turmaId,
                jogoId: jogo.jogoId,
            });
        }
        return {
            processed: jogos.length,
            jogos: jogos.map((item) => item.jogoId),
        };
    }
    async generateTeams() {
        const jogos = await this.repository.listGamesByStatuses(["FECHADO"]);
        const generated = [];
        for (const jogo of jogos) {
            try {
                const teams = await this.timeService.generate(jogo.jogoId);
                generated.push(jogo.jogoId);
                const sender = jogo.groupId ? (0, whatsapp_provider_1.makeWhatsAppSender)(jogo.provider) : null;
                if (sender && jogo.groupId) {
                    await sender.sendGroupMessage({
                        provider: jogo.provider,
                        groupId: jogo.groupId,
                        message: (0, utils_1.buildTeamsGeneratedMessage)({
                            turmaNome: jogo.turmaNome,
                            teams,
                        }),
                    });
                }
            }
            catch (error) {
                await this.logRepository.create({
                    tipo: "jobs.team_generation.skipped",
                    origem: "scheduler",
                    turmaId: jogo.turmaId,
                    jogoId: jogo.jogoId,
                    payload: {
                        error: error instanceof Error ? error.message : String(error),
                    },
                });
            }
        }
        return {
            processed: generated.length,
            jogos: generated,
        };
    }
}
exports.JobService = JobService;
function getNextOccurrence(referenceDate, targetDayOfWeek, horario) {
    const [hours, minutes] = horario.split(":").map(Number);
    const next = new Date(referenceDate);
    next.setSeconds(0, 0);
    next.setHours(hours ?? 20, minutes ?? 0, 0, 0);
    const currentDay = next.getDay();
    let diff = targetDayOfWeek - currentDay;
    if (diff < 0 || (diff === 0 && next <= referenceDate)) {
        diff += 7;
    }
    next.setDate(next.getDate() + diff);
    return next;
}
