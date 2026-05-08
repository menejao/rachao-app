"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaJogadorRepository = void 0;
const utils_1 = require("@rachao/utils");
class PrismaJogadorRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filters) {
        const jogadores = await this.prisma.jogador.findMany({
            where: filters?.turmaId ? { turmaId: filters.turmaId } : undefined,
            orderBy: [{ turmaId: "asc" }, { nome: "asc" }],
        });
        return jogadores.map((jogador) => ({
            id: jogador.id,
            turmaId: jogador.turmaId,
            nome: jogador.nome,
            telefone: jogador.telefone,
            email: jogador.email,
            posicao: jogador.posicao,
            nivel: jogador.nivel,
            ativo: jogador.ativo,
        }));
    }
    async create(input) {
        const turma = await this.prisma.turma.findUnique({
            where: { id: input.turmaId },
            select: { id: true },
        });
        if (!turma) {
            throw new Error("Turma não encontrada");
        }
        const jogador = await this.prisma.jogador.create({
            data: {
                turmaId: input.turmaId,
                nome: input.nome,
                telefone: (0, utils_1.normalizePhone)(input.telefone),
                email: input.email,
                posicao: input.posicao,
                nivel: input.nivel,
            },
        });
        return {
            id: jogador.id,
            turmaId: jogador.turmaId,
            nome: jogador.nome,
            telefone: jogador.telefone,
            email: jogador.email,
            posicao: jogador.posicao,
            nivel: jogador.nivel,
            ativo: jogador.ativo,
        };
    }
}
exports.PrismaJogadorRepository = PrismaJogadorRepository;
