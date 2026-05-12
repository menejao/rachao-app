import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createJogo } from "@/lib/store";
import { CreateJogoSchema } from "@/lib/schemas";
import { revalidateDashboard } from "@/lib/dashboard-data";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const parsed = CreateJogoSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });
    const body = parsed.data;
    const turmaId = body.turmaId || session.user.activeTeamId;
    if (!turmaId) {
      return NextResponse.json({ error: "turmaId obrigatório" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      const jogo = await db.jogo.create({
        data: {
          turmaId,
          dataJogo: new Date(body.dataJogo),
          status: "RASCUNHO",
          limitJogadores: body.limitJogadores ?? null,
          observacoes: body.observacoes ?? null,
        },
      });
      revalidateDashboard(session.user.id);
      return NextResponse.json({
        id: jogo.id,
        turmaId: jogo.turmaId,
        dataJogo: jogo.dataJogo.toISOString().slice(0, 10),
        status: jogo.status,
      }, { status: 201 });
    }

    const jogo = createJogo({ ...body, turmaId });
    return NextResponse.json(jogo, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
