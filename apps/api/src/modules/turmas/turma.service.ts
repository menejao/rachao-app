import type { CreateTurmaInput } from "@rachao/types";
import type { TurmaRepository } from "./turma.repository";

export class TurmaService {
  private readonly repository: TurmaRepository;

  constructor(repository: TurmaRepository) {
    this.repository = repository;
  }

  list(filters?: { organizadorId?: string }) {
    return this.repository.list(filters);
  }

  create(input: CreateTurmaInput) {
    return this.repository.create(input);
  }
}
