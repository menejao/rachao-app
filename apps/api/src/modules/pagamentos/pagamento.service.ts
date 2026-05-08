import { formatCurrency } from "@rachao/utils";
import type {
  CreatePagamentoInput,
  FinanceiroResumo,
  PagamentoSummary,
  UpdatePagamentoInput,
} from "@rachao/types";
import type { LogRepository } from "../logs/log.repository";
import { makeWhatsAppSender } from "../whatsapp/whatsapp.provider";
import type { JogadorRepository } from "../jogadores/jogador.repository";
import type { TurmaRepository } from "../turmas/turma.repository";
import type { PagamentoRepository } from "./pagamento.repository";

function toResumo(pagamentos: PagamentoSummary[], mes: number, ano: number): FinanceiroResumo {
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

export class PagamentoService {
  constructor(
    private readonly repository: PagamentoRepository,
    private readonly turmaRepository: TurmaRepository,
    private readonly jogadorRepository: JogadorRepository,
    private readonly logRepository: LogRepository
  ) {}

  list(filters?: { turmaId?: string; referenciaMes?: number; referenciaAno?: number }) {
    return this.repository.list(filters);
  }

  create(input: CreatePagamentoInput) {
    return this.repository.create(input);
  }

  update(id: string, input: UpdatePagamentoInput) {
    return this.repository.update(id, input);
  }

  markAsPaid(id: string, pagoEm?: string) {
    return this.repository.markAsPaid(id, pagoEm);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }

  async getResumo(filters?: { turmaId?: string; referenciaMes?: number; referenciaAno?: number }) {
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

  async cobrarInadimplentes(input: { turmaId: string; referenciaMes: number; referenciaAno: number }) {
    const [resumo, turmas, jogadores] = await Promise.all([
      this.getResumo(input),
      this.turmaRepository.list(),
      this.jogadorRepository.list({ turmaId: input.turmaId }),
    ]);

    const turma = turmas.find((item) => item.id === input.turmaId);
    if (!turma) {
      throw new Error("Turma não encontrada");
    }

    const provider = (turma as TurmaFinanceMeta).whatsappProvider ?? "mock";
    const groupId = (turma as TurmaFinanceMeta).whatsappGroupId ?? "grupo-quadra";
    const sender = makeWhatsAppSender(provider);

    for (const inadimplente of resumo.inadimplentes) {
      const jogador = jogadores.find((item) => item.id === inadimplente.jogadorId);
      const message = `Rachão ${turma.nome}: mensalidade ${input.referenciaMes}/${input.referenciaAno} pendente no valor de ${formatCurrency(inadimplente.valor)}.`;

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

type TurmaFinanceMeta = {
  whatsappProvider?: "mock" | "evolution" | "zapi";
  whatsappGroupId?: string;
};
