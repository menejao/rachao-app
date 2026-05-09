import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { markPagamentoPago } from "@/lib/store";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão. Apenas organizadores podem marcar pagamentos." }, { status: 403 });

    const { id } = await params;

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      const pagamento = await db.pagamento.update({
        where: { id },
        data: { status: "PAGO", pagoEm: new Date() },
        include: { jogador: true },
      });
      return NextResponse.json({
        id: pagamento.id,
        turmaId: pagamento.turmaId,
        jogadorId: pagamento.jogadorId,
        jogadorNome: pagamento.jogador.nome,
        referenciaMes: pagamento.referenciaMes,
        referenciaAno: pagamento.referenciaAno,
        valor: Number(pagamento.valor),
        status: pagamento.status,
        pagoEm: pagamento.pagoEm?.toISOString() ?? null,
      });
    }

    const pagamento = markPagamentoPago(id);
    return NextResponse.json(pagamento);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
