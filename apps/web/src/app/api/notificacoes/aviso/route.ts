import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendTextNotification, isWhatsAppConfigured } from "@/lib/notifications/service";
import { AvisoSchema } from "@/lib/schemas";

// POST /api/notificacoes/aviso
// body: { turmaId: string; mensagem: string; apenasAtivos?: boolean }
// Sends a free-text message to all players in the team
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

    const parsed = AvisoSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });
    const body = parsed.data;

    const { db } = await import("@/lib/prisma");

    const jogadores = await db.jogador.findMany({
      where: {
        turmaId: body.turmaId,
        ...(body.apenasAtivos !== false ? { ativo: true } : {}),
      },
    });

    const results = await Promise.allSettled(
      jogadores.map((j) => {
        const nome = j.nome.split(" ")[0] ?? j.nome;
        const text = `Oi ${nome}! *Rachão:* ${body.mensagem}`;
        return sendTextNotification(j.telefone, text, { turmaId: body.turmaId, logToDb: true });
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
    const failed = results.length - sent;

    return NextResponse.json({ ok: true, sent, failed, total: results.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
