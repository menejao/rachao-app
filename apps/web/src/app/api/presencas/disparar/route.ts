import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dispararPresencas } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const body = await req.json() as { turmaId?: string; dataJogo: string };
    if (!body.dataJogo) return NextResponse.json({ error: "dataJogo obrigatória" }, { status: 400 });

    const turmaId = body.turmaId || session.user.activeTeamId;

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");

      let jogo = await db.jogo.findFirst({
        where: { turmaId, dataJogo: { gte: new Date(body.dataJogo + "T00:00:00"), lt: new Date(body.dataJogo + "T23:59:59") } },
      });

      if (!jogo) {
        jogo = await db.jogo.create({
          data: { turmaId, dataJogo: new Date(body.dataJogo), status: "CONFIRMACAO_ABERTA" },
        });
      } else {
        await db.jogo.update({ where: { id: jogo.id }, data: { status: "CONFIRMACAO_ABERTA" } });
      }

      const jogadores = await db.jogador.findMany({ where: { turmaId, ativo: true } });
      const existingIds = (await db.presenca.findMany({ where: { jogoId: jogo.id }, select: { jogadorId: true } })).map((p) => p.jogadorId);

      const novos = jogadores.filter((j) => !existingIds.includes(j.id));
      if (novos.length > 0) {
        await db.presenca.createMany({
          data: novos.map((j) => ({ jogoId: jogo!.id, jogadorId: j.id, resposta: "PENDENTE" })),
        });
      }

      return NextResponse.json({ ok: true, jogoId: jogo.id, playerCount: jogadores.length });
    }

    const result = dispararPresencas(turmaId, body.dataJogo);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
