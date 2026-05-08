import type { CreateJogadorInput } from "@rachao/types";
import type { JogadorRepository } from "./jogador.repository";

export class JogadorService {
  private readonly repository: JogadorRepository;

  constructor(repository: JogadorRepository) {
    this.repository = repository;
  }

  list(filters?: { turmaId?: string }) {
    return this.repository.list(filters);
  }

  create(input: CreateJogadorInput) {
    return this.repository.create(input);
  }
}
