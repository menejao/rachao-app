import type { EstatisticasResumo, GoalSummary, RankingEntry } from "@rachao/types";
import type { GolRepository } from "../gols/gol.repository";
import type { PresencaRepository } from "../presencas/presenca.repository";
import type { TurmaRepository } from "../turmas/turma.repository";
import type { JogadorRepository } from "../jogadores/jogador.repository";

export class EstatisticaService {
  constructor(
    private readonly golRepository: GolRepository,
    private readonly turmaRepository: TurmaRepository,
    private readonly jogadorRepository: JogadorRepository,
    private readonly presencaRepository: Pick<PresencaRepository, "listForStats">
  ) {}

  async getResumo(): Promise<EstatisticasResumo> {
    const [gols, turmas, jogadores, presencas] = await Promise.all([
      this.golRepository.list(),
      this.turmaRepository.list(),
      this.jogadorRepository.list(),
      this.presencaRepository.listForStats(),
    ]);

    const turmaMap = new Map(turmas.map((item) => [item.id, item.nome]));
    const jogadorMap = new Map(
      jogadores.map((item) => [
        item.id,
        { nome: item.nome, turmaId: item.turmaId, turmaNome: turmaMap.get(item.turmaId) ?? "Turma" },
      ])
    );

    return {
      gols,
      artilharia: buildRankingFromGoals(gols),
      presencaRanking: buildRankingFromPresencas(presencas, jogadorMap),
    };
  }
}

function buildRankingFromGoals(goals: GoalSummary[]): RankingEntry[] {
  const score = new Map<string, RankingEntry>();

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

function buildRankingFromPresencas(
  presencas: Array<{ jogadorId: string; resposta: "SIM" | "NAO" | "PENDENTE" }>,
  jogadorMap: Map<string, { nome: string; turmaId: string; turmaNome: string }>
): RankingEntry[] {
  const score = new Map<string, RankingEntry>();

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

function sortRanking(left: RankingEntry, right: RankingEntry) {
  if (right.total !== left.total) {
    return right.total - left.total;
  }

  return left.jogadorNome.localeCompare(right.jogadorNome, "pt-BR");
}
