import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendNotification, isWhatsAppConfigured } from "@/lib/notifications/service";
import { LembreteSchema } from "@/lib/schemas";

// POST /api/notificacoes/lembrete
// body: { jogoId: string }
// Sends lembrete_jogo to all PENDENTE or SIM presencas in the game
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    if (!isWhatsAppConfigured()) {
      return NextResponse.json({ error: "WhatsApp não configurado. Adicione META_WA_PHONE_NUMBER_ID e META_WA_ACCESS_TOKEN." }, { status: 503 });
    }

    const parsed = LembreteSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });
    const body = parsed.data;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Banco de dados não configurado." }, { status: 503 });
    }

    const { db } = await import("@/lib/prisma");

    const jogo = await db.jogo.findUnique({
      where: { id: body.jogoId },
      include: {
        turma: true,
        presencas: {
          where: { resposta: { in: ["SIM", "PENDENTE"] }, posicaoFila: null },
          include: { jogador: true },
        },
      },
    });

    if (!jogo) return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });

    const dataJogo = jogo.dataJogo;
    const dataStr = dataJogo.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
    const horaStr = dataJogo.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://rachao.app";
    const link = `${appUrl}/jogos/${jogo.id}`;

    const results = await Promise.allSettled(
      jogo.presencas.map((p) =>
        sendNotification(
          "lembrete_jogo",
          p.jogador.telefone,
          {
            nome: p.jogador.nome.split(" ")[0] ?? p.jogador.nome,
            equipe: jogo.turma.nome,
            data: dataStr,
            hora: horaStr,
            local: jogo.turma.local ?? "local a confirmar",
            link,
          },
          { turmaId: jogo.turmaId, logToDb: true }
        )
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
    const failed = results.length - sent;

    return NextResponse.json({ ok: true, sent, failed, total: results.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
