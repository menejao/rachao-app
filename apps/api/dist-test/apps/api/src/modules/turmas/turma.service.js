"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurmaService = void 0;
class TurmaService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    list(filters) {
        return this.repository.list(filters);
    }
    create(input) {
        return this.repository.create(input);
    }
}
exports.TurmaService = TurmaService;
