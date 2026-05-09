import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const { id } = await params;
    const body = await req.json() as { status?: string; observacoes?: string };

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      const jogo = await db.jogo.update({
        where: { id },
        data: {
          ...(body.status !== undefined && { status: body.status as never }),
          ...(body.observacoes !== undefined && { observacoes: body.observacoes }),
        },
      });
      return NextResponse.json({
        id: jogo.id,
        turmaId: jogo.turmaId,
        dataJogo: jogo.dataJogo.toISOString().slice(0, 10),
        status: jogo.status,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const { id } = await params;

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      await db.jogo.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
