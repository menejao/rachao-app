"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTurmaRepository = void 0;
class PrismaTurmaRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filters) {
        const turmas = await this.prisma.turma.findMany({
            where: filters?.organizadorId ? { organizadorId: filters.organizadorId } : undefined,
            include: {
                _count: {
                    select: { jogadores: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return turmas.map((turma) => ({
            id: turma.id,
            nome: turma.nome,
            local: turma.local,
            diaSemana: turma.diaSemana,
            horario: turma.horario,
            mensalidade: Number(turma.mensalidade),
            status: turma.status,
            createdAt: turma.createdAt.toISOString(),
            updatedAt: turma.updatedAt.toISOString(),
            totalJogadores: turma._count.jogadores,
        }));
    }
    async create(input) {
        const organizador = await this.prisma.organizador.upsert({
            where: { id: input.organizadorId },
            create: {
                id: input.organizadorId,
                nome: "Organizador MVP",
                email: `${input.organizadorId}@rachao.local`,
            },
            update: {},
        });
        const turma = await this.prisma.turma.create({
            data: {
                nome: input.nome,
                local: input.local,
                diaSemana: input.diaSemana,
                horario: input.horario,
                mensalidade: input.mensalidade,
                organizadorId: organizador.id,
                whatsappGroupId: input.whatsappGroupId,
                whatsappProvider: input.whatsappProvider,
            },
        });
        return {
            id: turma.id,
            nome: turma.nome,
            local: turma.local,
            diaSemana: turma.diaSemana,
            horario: turma.horario,
            mensalidade: Number(turma.mensalidade),
            status: turma.status,
            createdAt: turma.createdAt.toISOString(),
            updatedAt: turma.updatedAt.toISOString(),
            totalJogadores: 0,
        };
    }
}
exports.PrismaTurmaRepository = PrismaTurmaRepository;
