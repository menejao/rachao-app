import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createJogo } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const body = await req.json() as { turmaId?: string; dataJogo: string };
    const turmaId = body.turmaId || session.user.activeTeamId;
    if (!turmaId || !body.dataJogo) {
      return NextResponse.json({ error: "turmaId e dataJogo são obrigatórios" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      const jogo = await db.jogo.create({
        data: {
          turmaId,
          dataJogo: new Date(body.dataJogo),
          status: "RASCUNHO",
        },
      });
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
