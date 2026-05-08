import type { CreateJogadorInput } from "@rachao/types";
import type { JogadorRepository, UpdateJogadorInput } from "./jogador.repository";

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

  update(id: string, input: UpdateJogadorInput) {
    return this.repository.update(id, input);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
