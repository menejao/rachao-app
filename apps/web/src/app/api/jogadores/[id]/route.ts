import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateJogador, deleteJogador } from "@/lib/store";
import { UpdateJogadorSchema } from "@/lib/schemas";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const { id } = await params;
    const parsed = UpdateJogadorSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });
    const body = parsed.data;

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      const jogador = await db.jogador.update({
        where: { id },
        data: {
          ...(body.nome !== undefined && { nome: body.nome }),
          ...(body.telefone !== undefined && { telefone: body.telefone }),
          ...(body.email !== undefined && { email: body.email }),
          ...(body.posicao !== undefined && { posicao: body.posicao }),
          ...(body.nivel !== undefined && { nivel: body.nivel }),
          ...(body.ativo !== undefined && { ativo: body.ativo }),
        },
      });
      return NextResponse.json({
        id: jogador.id,
        turmaId: jogador.turmaId,
        nome: jogador.nome,
        telefone: jogador.telefone,
        email: jogador.email,
        posicao: jogador.posicao,
        nivel: jogador.nivel,
        ativo: jogador.ativo,
      });
    }

    const jogador = updateJogador(id, body);
    return NextResponse.json(jogador);
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
      await db.jogador.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    deleteJogador(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
