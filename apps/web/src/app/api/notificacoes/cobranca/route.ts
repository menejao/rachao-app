import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendNotification, isWhatsAppConfigured } from "@/lib/notifications/service";
import { formatCurrency } from "@rachao/utils";
import { CobrancaSchema } from "@/lib/schemas";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// POST /api/notificacoes/cobranca
// body: { pagamentoId?: string; turmaId?: string; mes?: number; ano?: number }
// When pagamentoId: sends to single player
// When turmaId + mes + ano: sends to all PENDENTE/ATRASADO in that month
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    if (!isWhatsAppConfigured()) {
      return NextResponse.json({ error: "WhatsApp não configurado." }, { status: 503 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Banco de dados não configurado." }, { status: 503 });
    }

    const parsed = CobrancaSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });
    const body = parsed.data;
    const { db } = await import("@/lib/prisma");

    let pagamentos: {
      id: string;
      valor: number | { toNumber(): number };
      referenciaMes: number;
      referenciaAno: number;
      turmaId: string;
      jogador: { nome: string; telefone: string };
      turma: { nome: string };
    }[] = [];

    if ("pagamentoId" in body && body.pagamentoId) {
      const p = await db.pagamento.findUnique({
        where: { id: body.pagamentoId },
        include: { jogador: true, turma: true },
      });
      if (!p) return NextResponse.json({ error: "Pagamento não encontrado." }, { status: 404 });
      pagamentos = [p as typeof pagamentos[0]];
    } else if ("turmaId" in body) {
      const ps = await db.pagamento.findMany({
        where: {
          turmaId: body.turmaId,
          referenciaMes: body.mes,
          referenciaAno: body.ano,
          status: { in: ["PENDENTE", "ATRASADO"] },
        },
        include: { jogador: true, turma: true },
      });
      pagamentos = ps as typeof pagamentos;
    }

    const results = await Promise.allSettled(
      pagamentos.map((p) => {
        const valor = typeof p.valor === "number" ? p.valor : p.valor.toNumber();
        const mesStr = MESES[(p.referenciaMes - 1)] ?? String(p.referenciaMes);
        return sendNotification(
          "cobranca_mensalidade",
          p.jogador.telefone,
          {
            nome: p.jogador.nome.split(" ")[0] ?? p.jogador.nome,
            valor: formatCurrency(valor),
            mes: mesStr,
            ano: String(p.referenciaAno),
            equipe: p.turma.nome,
          },
          { turmaId: p.turmaId, logToDb: true }
        );
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
    const failed = results.length - sent;

    return NextResponse.json({ ok: true, sent, failed, total: results.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
