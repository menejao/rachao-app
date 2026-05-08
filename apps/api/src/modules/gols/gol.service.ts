import { parseGoalCommand } from "@rachao/utils";
import type { LogRepository } from "../logs/log.repository";
import type { GolRepository } from "./gol.repository";

export class GolService {
  constructor(private readonly repository: GolRepository, private readonly logRepository: LogRepository) {}

  async registerFromCommand(input: { provider: string; groupId?: string; message: string }) {
    const parsed = parseGoalCommand(input.message);
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
      command: "/gol" as const,
      goal,
    };
  }
}
