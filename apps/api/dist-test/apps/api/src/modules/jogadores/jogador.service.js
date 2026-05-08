"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JogadorService = void 0;
class JogadorService {
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
exports.JogadorService = JogadorService;
