"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaLogRepository = void 0;
class PrismaLogRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(input) {
        await this.prisma.eventoLog.create({
            data: {
                tipo: input.tipo,
                origem: input.origem,
                turmaId: input.turmaId,
                jogoId: input.jogoId,
                jogadorId: input.jogadorId,
                payload: input.payload,
            },
        });
    }
    async list(filters) {
        const rows = await this.prisma.eventoLog.findMany({
            where: {
                turmaId: filters.turmaId,
                jogoId: filters.jogoId,
            },
            orderBy: { createdAt: "desc" },
            take: filters.limit,
        });
        return rows.map((row) => ({
            id: row.id,
            tipo: row.tipo,
            origem: row.origem,
            turmaId: row.turmaId,
            jogoId: row.jogoId,
            jogadorId: row.jogadorId,
            payload: row.payload,
            createdAt: row.createdAt.toISOString(),
        }));
    }
}
exports.PrismaLogRepository = PrismaLogRepository;
