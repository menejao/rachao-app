"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagamentoService = void 0;
const utils_1 = require("@rachao/utils");
const whatsapp_provider_1 = require("../whatsapp/whatsapp.provider");
function toResumo(pagamentos, mes, ano) {
    const doMes = pagamentos.filter((item) => item.referenciaMes === mes && item.referenciaAno === ano);
    const recebidosMes = doMes
        .filter((item) => item.status === "PAGO")
        .reduce((sum, item) => sum + item.valor, 0);
    const pendentesMes = doMes
        .filter((item) => item.status === "PENDENTE" || item.status === "ATRASADO")
        .reduce((sum, item) => sum + item.valor, 0);
    const inadimplentes = doMes.filter((item) => item.status === "PENDENTE" || item.status === "ATRASADO");
    return {
        saldoMensal: Number((recebidosMes - pendentesMes).toFixed(2)),
        recebidosMes: Number(recebidosMes.toFixed(2)),
        pendentesMes: Number(pendentesMes.toFixed(2)),
        inadimplentes,
        pagamentos,
    };
}
class PagamentoService {
    repository;
    turmaRepository;
    jogadorRepository;
    logRepository;
    constructor(repository, turmaRepository, jogadorRepository, logRepository) {
        this.repository = repository;
        this.turmaRepository = turmaRepository;
        this.jogadorRepository = jogadorRepository;
        this.logRepository = logRepository;
    }
    list(filters) {
        return this.repository.list(filters);
    }
    create(input) {
        return this.repository.create(input);
    }
    update(id, input) {
        return this.repository.update(id, input);
    }
    markAsPaid(id, pagoEm) {
        return this.repository.markAsPaid(id, pagoEm);
    }
    delete(id) {
        return this.repository.delete(id);
    }
    async getResumo(filters) {
        const now = new Date();
        const mes = filters?.referenciaMes ?? now.getMonth() + 1;
        const ano = filters?.referenciaAno ?? now.getFullYear();
        const pagamentos = await this.repository.list({
            turmaId: filters?.turmaId,
            referenciaMes: mes,
            referenciaAno: ano,
        });
        return toResumo(pagamentos, mes, ano);
    }
    async cobrarInadimplentes(input) {
        const [resumo, turmas, jogadores] = await Promise.all([
            this.getResumo(input),
            this.turmaRepository.list(),
            this.jogadorRepository.list({ turmaId: input.turmaId }),
        ]);
        const turma = turmas.find((item) => item.id === input.turmaId);
        if (!turma) {
            throw new Error("Turma não encontrada");
        }
        const provider = turma.whatsappProvider ?? "mock";
        const groupId = turma.whatsappGroupId ?? "grupo-quadra";
        const sender = (0, whatsapp_provider_1.makeWhatsAppSender)(provider);
        for (const inadimplente of resumo.inadimplentes) {
            const jogador = jogadores.find((item) => item.id === inadimplente.jogadorId);
            const message = `Rachão ${turma.nome}: mensalidade ${input.referenciaMes}/${input.referenciaAno} pendente no valor de ${(0, utils_1.formatCurrency)(inadimplente.valor)}.`;
            await sender.sendGroupMessage({
                provider,
                groupId,
                message: `[cobranca-mock] ${jogador?.nome ?? inadimplente.jogadorNome}: ${message}`,
            });
            await this.logRepository.create({
                tipo: "finance.charge.sent",
                origem: provider,
                turmaId: turma.id,
                jogadorId: inadimplente.jogadorId,
                payload: {
                    referenciaMes: input.referenciaMes,
                    referenciaAno: input.referenciaAno,
                    valor: inadimplente.valor,
                },
            });
        }
        return {
            ok: true,
            enviados: resumo.inadimplentes.length,
            inadimplentes: resumo.inadimplentes,
        };
    }
}
exports.PagamentoService = PagamentoService;
