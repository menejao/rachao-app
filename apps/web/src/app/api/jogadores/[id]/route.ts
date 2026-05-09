import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateJogador, deleteJogador } from "@/lib/store";
import type { Posicao } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const { id } = await params;
    const body = await req.json() as Record<string, unknown>;

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      const jogador = await db.jogador.update({
        where: { id },
        data: {
          ...(body.nome !== undefined && { nome: body.nome as string }),
          ...(body.telefone !== undefined && { telefone: body.telefone as string }),
          ...(body.email !== undefined && { email: body.email as string | null }),
          ...(body.posicao !== undefined && { posicao: body.posicao as Posicao }),
          ...(body.nivel !== undefined && { nivel: body.nivel as number }),
          ...(body.ativo !== undefined && { ativo: body.ativo as boolean }),
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

    const jogador = updateJogador(id, body as Parameters<typeof updateJogador>[1]);
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
