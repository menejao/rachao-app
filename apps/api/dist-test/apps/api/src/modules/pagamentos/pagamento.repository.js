"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPagamentoRepository = void 0;
class PrismaPagamentoRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filters) {
        const rows = await this.prisma.pagamento.findMany({
            where: {
                turmaId: filters?.turmaId,
                referenciaMes: filters?.referenciaMes,
                referenciaAno: filters?.referenciaAno,
            },
            include: {
                jogador: true,
            },
            orderBy: [{ referenciaAno: "desc" }, { referenciaMes: "desc" }, { jogador: { nome: "asc" } }],
        });
        return rows.map((row) => ({
            id: row.id,
            turmaId: row.turmaId,
            jogadorId: row.jogadorId,
            jogadorNome: row.jogador.nome,
            referenciaMes: row.referenciaMes,
            referenciaAno: row.referenciaAno,
            valor: Number(row.valor),
            status: row.status,
            pagoEm: row.pagoEm?.toISOString() ?? null,
        }));
    }
    async create(input) {
        const row = await this.prisma.pagamento.create({
            data: {
                turmaId: input.turmaId,
                jogadorId: input.jogadorId,
                referenciaMes: input.referenciaMes,
                referenciaAno: input.referenciaAno,
                valor: input.valor,
                status: input.status ?? "PENDENTE",
                pagoEm: input.status === "PAGO" ? new Date() : null,
            },
            include: { jogador: true },
        });
        return {
            id: row.id,
            turmaId: row.turmaId,
            jogadorId: row.jogadorId,
            jogadorNome: row.jogador.nome,
            referenciaMes: row.referenciaMes,
            referenciaAno: row.referenciaAno,
            valor: Number(row.valor),
            status: row.status,
            pagoEm: row.pagoEm?.toISOString() ?? null,
        };
    }
    async update(id, input) {
        const row = await this.prisma.pagamento.update({
            where: { id },
            data: {
                valor: input.valor,
                status: input.status,
                pagoEm: input.status === "PAGO" ? new Date() : input.status ? null : undefined,
            },
            include: { jogador: true },
        });
        return {
            id: row.id,
            turmaId: row.turmaId,
            jogadorId: row.jogadorId,
            jogadorNome: row.jogador.nome,
            referenciaMes: row.referenciaMes,
            referenciaAno: row.referenciaAno,
            valor: Number(row.valor),
            status: row.status,
            pagoEm: row.pagoEm?.toISOString() ?? null,
        };
    }
    async markAsPaid(id, pagoEm) {
        const row = await this.prisma.pagamento.update({
            where: { id },
            data: {
                status: "PAGO",
                pagoEm: pagoEm ? new Date(pagoEm) : new Date(),
            },
            include: { jogador: true },
        });
        return {
            id: row.id,
            turmaId: row.turmaId,
            jogadorId: row.jogadorId,
            jogadorNome: row.jogador.nome,
            referenciaMes: row.referenciaMes,
            referenciaAno: row.referenciaAno,
            valor: Number(row.valor),
            status: row.status,
            pagoEm: row.pagoEm?.toISOString() ?? null,
        };
    }
    async delete(id) {
        await this.prisma.pagamento.delete({ where: { id } });
    }
}
exports.PrismaPagamentoRepository = PrismaPagamentoRepository;
