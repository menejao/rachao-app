import type {
  CreateJogadorInput,
  CreatePagamentoInput,
  CreateTurmaInput,
  EventoLogEntry,
  GoalSummary,
  GeneratedTeam,
  JogadorSummary,
  PagamentoSummary,
  TurmaSummary,
  UpdatePagamentoInput,
  WhatsAppProvider,
} from "@rachao/types";
import { normalizeName, normalizePhone } from "@rachao/utils";
import { addDemoLog, demoStore, mapConfirmedPlayersForGame } from "./demo-store";
import type { LogRepository } from "../modules/logs/log.repository";
import type {
  ConfirmedPlayersContext,
  TimeRepository,
} from "../modules/times/time.repository";
import type {
  PresenceDispatchContext,
  PresenceWebhookContext,
  PresencaRepository,
} from "../modules/presencas/presenca.repository";
import type { TurmaRepository, UpdateTurmaInput } from "../modules/turmas/turma.repository";
import type { JogadorRepository, UpdateJogadorInput } from "../modules/jogadores/jogador.repository";
import type { PagamentoRepository } from "../modules/pagamentos/pagamento.repository";
import type { GolRepository, GoalCommandContext } from "../modules/gols/gol.repository";

export class MockTurmaRepository implements TurmaRepository {
  async list(filters?: { organizadorId?: string }) {
    void filters;
    return demoStore.turmas.map((item) => ({ ...item }));
  }

  async create(input: CreateTurmaInput) {
    const turma: TurmaSummary & { whatsappGroupId?: string; whatsappProvider?: "mock" | "evolution" | "zapi" } = {
      id: `turma-demo-${demoStore.turmas.length + 1}`,
      nome: input.nome,
      local: input.local ?? null,
      diaSemana: input.diaSemana,
      horario: input.horario,
      mensalidade: input.mensalidade,
      status: "ATIVA",
      totalJogadores: 0,
      whatsappGroupId: input.whatsappGroupId,
      whatsappProvider: (input.whatsappProvider ?? "mock") as WhatsAppProvider,
    };
    demoStore.turmas.unshift(turma);
    return turma;
  }

  async update(id: string, input: UpdateTurmaInput): Promise<TurmaSummary> {
    const turma = demoStore.turmas.find((t) => t.id === id);
    if (!turma) throw new Error("Turma nao encontrada");
    if (input.nome !== undefined) turma.nome = input.nome;
    if (input.local !== undefined) turma.local = input.local;
    if (input.diaSemana !== undefined) turma.diaSemana = input.diaSemana;
    if (input.horario !== undefined) turma.horario = input.horario;
    if (input.mensalidade !== undefined) turma.mensalidade = input.mensalidade;
    return { ...turma };
  }
}

export class MockJogadorRepository implements JogadorRepository {
  async list(filters?: { turmaId?: string }) {
    return demoStore.jogadores.filter((item) => !filters?.turmaId || item.turmaId === filters.turmaId);
  }

  async create(input: CreateJogadorInput) {
    const jogador: JogadorSummary = {
      id: `j${demoStore.jogadores.length + 1}`,
      turmaId: input.turmaId,
      nome: input.nome,
      telefone: normalizePhone(input.telefone),
      email: input.email ?? null,
      posicao: input.posicao,
      nivel: input.nivel,
      ativo: true,
    };
    demoStore.jogadores.push(jogador);
    const turma = demoStore.turmas.find((item) => item.id === input.turmaId);
    if (turma) turma.totalJogadores = (turma.totalJogadores ?? 0) + 1;
    return jogador;
  }

  async update(id: string, input: UpdateJogadorInput): Promise<JogadorSummary> {
    const jogador = demoStore.jogadores.find((j) => j.id === id);
    if (!jogador) throw new Error("Jogador não encontrado");
    if (input.nome !== undefined) jogador.nome = input.nome;
    if (input.telefone !== undefined) jogador.telefone = normalizePhone(input.telefone);
    if (input.email !== undefined) jogador.email = input.email;
    if (input.posicao !== undefined) jogador.posicao = input.posicao;
    if (input.nivel !== undefined) jogador.nivel = input.nivel;
    if (input.ativo !== undefined) jogador.ativo = input.ativo;
    return { ...jogador };
  }

  async delete(id: string): Promise<void> {
    const idx = demoStore.jogadores.findIndex((j) => j.id === id);
    if (idx !== -1) {
      const turma = demoStore.turmas.find((t) => t.id === demoStore.jogadores[idx]!.turmaId);
      if (turma && turma.totalJogadores) turma.totalJogadores--;
      demoStore.jogadores.splice(idx, 1);
    }
  }
}

export class MockLogRepository implements LogRepository {
  async create(input: {
    tipo: string;
    origem: string;
    turmaId?: string | null;
    jogoId?: string | null;
    jogadorId?: string | null;
    payload?: unknown;
  }) {
    addDemoLog(input);
  }

  async list(filters: { turmaId?: string; jogoId?: string; limit: number }): Promise<EventoLogEntry[]> {
    return demoStore.logs
      .filter((entry) => (!filters.turmaId || entry.turmaId === filters.turmaId) && (!filters.jogoId || entry.jogoId === filters.jogoId))
      .slice(0, filters.limit);
  }
}

export class MockPresencaRepository implements PresencaRepository {
  async getDispatchContext(turmaId: string): Promise<PresenceDispatchContext | null> {
    const turma = demoStore.turmas.find((item) => item.id === turmaId);
    if (!turma) return null;
    return {
      turmaId: turma.id,
      turmaNome: turma.nome,
      whatsappGroupId: turma.whatsappGroupId ?? null,
      whatsappProvider: turma.whatsappProvider ?? "mock",
      jogadores: demoStore.jogadores
        .filter((item) => item.turmaId === turmaId && item.ativo)
        .map((item) => ({ id: item.id, nome: item.nome, telefone: item.telefone })),
    };
  }

  async createOrOpenGame(input: { turmaId: string; dataJogo: Date }) {
    const iso = input.dataJogo.toISOString().slice(0, 10);
    const existing = demoStore.jogos.find((item) => item.turmaId === input.turmaId && item.dataJogo === iso);
    if (existing) {
      existing.status = "CONFIRMACAO_ABERTA";
      return { id: existing.id, dataJogo: input.dataJogo };
    }
    const game = { id: `g-demo-${demoStore.jogos.length + 1}`, turmaId: input.turmaId, dataJogo: iso, status: "CONFIRMACAO_ABERTA" as const };
    demoStore.jogos.push(game);
    return { id: game.id, dataJogo: input.dataJogo };
  }

  async upsertPendingPresencas(input: { jogoId: string; jogadorIds: string[] }) {
    for (const jogadorId of input.jogadorIds) {
      const existing = demoStore.presencas.find((item) => item.jogoId === input.jogoId && item.jogadorId === jogadorId);
      if (!existing) {
        demoStore.presencas.push({
          id: `p-${demoStore.presencas.length + 1}`,
          jogoId: input.jogoId,
          jogadorId,
          resposta: "PENDENTE",
          timeId: null,
        });
      }
    }
  }

  async resolveWebhookContext(input: { groupId?: string; fromPhone: string }): Promise<PresenceWebhookContext | null> {
    const turma = demoStore.turmas.find((item) => !input.groupId || item.whatsappGroupId === input.groupId);
    const player = demoStore.jogadores.find((item) => item.telefone === input.fromPhone && (!turma || item.turmaId === turma.id));
    const game = demoStore.jogos.find((item) => item.turmaId === player?.turmaId && item.status === "CONFIRMACAO_ABERTA");
    if (!player || !game) return null;
    return { jogoId: game.id, turmaId: player.turmaId, playerId: player.id, playerName: player.nome };
  }

  async resolveTimesCommandContext(input: { groupId?: string }) {
    const turma = demoStore.turmas.find((item) => !input.groupId || item.whatsappGroupId === input.groupId);
    const jogo = demoStore.jogos.find((item) => item.turmaId === turma?.id);
    if (!turma || !jogo) return null;
    return { jogoId: jogo.id, turmaId: turma.id };
  }

  async savePresenceResponse(input: { jogoId: string; playerId: string; resposta: "SIM" | "NAO" }) {
    const existing = demoStore.presencas.find((item) => item.jogoId === input.jogoId && item.jogadorId === input.playerId);
    if (existing) {
      existing.resposta = input.resposta;
      return;
    }
    demoStore.presencas.push({
      id: `p-${demoStore.presencas.length + 1}`,
      jogoId: input.jogoId,
      jogadorId: input.playerId,
      resposta: input.resposta,
      timeId: null,
    });
  }

  async listForStats() {
    return demoStore.presencas.map((item) => ({
      jogadorId: item.jogadorId,
      resposta: item.resposta,
    }));
  }

  async updatePresenca(id: string, resposta: "SIM" | "NAO" | "PENDENTE") {
    const presenca = demoStore.presencas.find((item) => item.id === id);
    if (!presenca) throw new Error("Presenca nao encontrada");
    presenca.resposta = resposta;
  }
}

export class MockTimeRepository implements TimeRepository {
  async getConfirmedPlayers(jogoId: string): Promise<ConfirmedPlayersContext | null> {
    const jogo = demoStore.jogos.find((item) => item.id === jogoId);
    if (!jogo) return null;
    return {
      jogoId,
      turmaId: jogo.turmaId,
      jogadores: mapConfirmedPlayersForGame(jogoId),
    };
  }

  async replaceTeams(jogoId: string, teams: GeneratedTeam[]) {
    demoStore.times = demoStore.times.filter((item) => !item.id.startsWith(`${jogoId}-`));
    demoStore.presencas.forEach((presence) => {
      if (presence.jogoId === jogoId) presence.timeId = null;
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
      demoStore.times.push(persisted);
      for (const player of team.jogadores) {
        const presence = demoStore.presencas.find((item) => item.jogoId === jogoId && item.jogadorId === player.id);
        if (presence) presence.timeId = persisted.id;
      }
      return persisted;
    });
  }
}

export class MockPagamentoRepository implements PagamentoRepository {
  async list(filters?: { turmaId?: string; referenciaMes?: number; referenciaAno?: number }): Promise<PagamentoSummary[]> {
    return demoStore.pagamentos.filter(
      (item) =>
        (!filters?.turmaId || item.turmaId === filters.turmaId) &&
        (!filters?.referenciaMes || item.referenciaMes === filters.referenciaMes) &&
        (!filters?.referenciaAno || item.referenciaAno === filters.referenciaAno)
    );
  }

  async create(input: CreatePagamentoInput): Promise<PagamentoSummary> {
    const jogador = demoStore.jogadores.find((item) => item.id === input.jogadorId);
    const pagamento: PagamentoSummary = {
      id: `pg${demoStore.pagamentos.length + 1}`,
      turmaId: input.turmaId,
      jogadorId: input.jogadorId,
      jogadorNome: jogador?.nome ?? "Jogador",
      referenciaMes: input.referenciaMes,
      referenciaAno: input.referenciaAno,
      valor: input.valor,
      status: input.status ?? "PENDENTE",
      pagoEm: input.status === "PAGO" ? new Date().toISOString() : null,
    };
    demoStore.pagamentos.unshift(pagamento);
    return pagamento;
  }

  async update(id: string, input: UpdatePagamentoInput): Promise<PagamentoSummary> {
    const pagamento = demoStore.pagamentos.find((item) => item.id === id);
    if (!pagamento) throw new Error("Pagamento não encontrado");
    if (typeof input.valor === "number") pagamento.valor = input.valor;
    if (input.status) {
      pagamento.status = input.status;
      pagamento.pagoEm = input.status === "PAGO" ? new Date().toISOString() : null;
    }
    return pagamento;
  }

  async markAsPaid(id: string, pagoEm?: string): Promise<PagamentoSummary> {
    const pagamento = demoStore.pagamentos.find((item) => item.id === id);
    if (!pagamento) throw new Error("Pagamento não encontrado");
    pagamento.status = "PAGO";
    pagamento.pagoEm = pagoEm ?? new Date().toISOString();
    return pagamento;
  }

  async delete(id: string): Promise<void> {
    demoStore.pagamentos = demoStore.pagamentos.filter((item) => item.id !== id);
  }
}

export class MockGolRepository implements GolRepository {
  async resolveGoalCommandContext(input: { groupId?: string; playerName: string }): Promise<GoalCommandContext | null> {
    const turma = demoStore.turmas.find((item) => !input.groupId || item.whatsappGroupId === input.groupId);
    const jogo = demoStore.jogos.find((item) => item.turmaId === turma?.id);
    const normalizedTarget = normalizeName(input.playerName);
    const jogador = demoStore.jogadores.find(
      (item) =>
        item.turmaId === turma?.id &&
        (normalizeName(item.nome) === normalizedTarget || normalizeName(item.nome).includes(normalizedTarget))
    );

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

  async create(input: { jogoId: string; jogadorId: string; assistenciaId?: string | null; minuto?: number | null }): Promise<GoalSummary> {
    const jogador = demoStore.jogadores.find((item) => item.id === input.jogadorId);
    const jogo = demoStore.jogos.find((item) => item.id === input.jogoId);
    const turma = demoStore.turmas.find((item) => item.id === jogo?.turmaId);

    if (!jogador || !jogo || !turma) {
      throw new Error("Contexto do gol nao encontrado");
    }

    const goal: GoalSummary = {
      id: `gol-${demoStore.gols.length + 1}`,
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

    demoStore.gols.unshift(goal);
    return goal;
  }

  async list() {
    return demoStore.gols.map((item) => ({ ...item }));
  }
}
