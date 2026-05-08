import { generateBalancedTeams } from "@rachao/utils";
import type { LogRepository } from "../logs/log.repository";
import type { TimeRepository } from "./time.repository";

export class TimeService {
  private readonly repository: TimeRepository;
  private readonly logRepository: LogRepository;

  constructor(repository: TimeRepository, logRepository: LogRepository) {
    this.repository = repository;
    this.logRepository = logRepository;
  }

  async generate(jogoId: string, teamCount?: number) {
    const context = await this.repository.getConfirmedPlayers(jogoId);
    if (!context) {
      throw new Error("Jogo não encontrado");
    }

    if (context.jogadores.length < 2) {
      throw new Error("Jogadores confirmados insuficientes para gerar times");
    }

    const teams = generateBalancedTeams(context.jogadores, teamCount);
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
