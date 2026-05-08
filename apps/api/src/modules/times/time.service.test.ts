import assert from "node:assert/strict";
import type { GeneratedTeam, TeamDraftPlayer } from "@rachao/types";
import type { LogRepository } from "../logs/log.repository";
import type { ConfirmedPlayersContext, TimeRepository } from "./time.repository";
import { TimeService } from "./time.service";

class InMemoryLogRepository implements LogRepository {
  async create() {}
  async list() {
    return [];
  }
}

class InMemoryTimeRepository implements TimeRepository {
  async getConfirmedPlayers(): Promise<ConfirmedPlayersContext | null> {
    return {
      jogoId: "g1",
      turmaId: "t1",
      jogadores: [
        { id: "1", nome: "G1", posicao: "GOLEIRO", nivel: 5 },
        { id: "2", nome: "G2", posicao: "GOLEIRO", nivel: 4 },
        { id: "3", nome: "A1", posicao: "ALA", nivel: 5 },
        { id: "4", nome: "A2", posicao: "ALA", nivel: 4 },
        { id: "5", nome: "F1", posicao: "FIXO", nivel: 3 },
        { id: "6", nome: "P1", posicao: "PIVO", nivel: 2 },
      ],
    };
  }

  async replaceTeams(_jogoId: string, teams: GeneratedTeam[]) {
    return teams.map((team, index) => ({
      id: `time-${index + 1}`,
      nome: team.nome,
      cor: team.cor,
      nivelMedio: team.nivelMedio,
      jogadores: team.jogadores as TeamDraftPlayer[],
    }));
  }
}

export async function runTimeServiceTests() {
  const service = new TimeService(new InMemoryTimeRepository(), new InMemoryLogRepository());
  const result = await service.generate("g1", 2);

  assert.equal(result.length, 2);
  assert.equal(result[0]?.jogadores.length, 3);
  assert.equal(result[1]?.jogadores.length, 3);
}
