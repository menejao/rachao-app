import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createJogador } from "@/lib/store";
import type { Posicao } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const body = await req.json() as { turmaId?: string; nome: string; telefone: string; email?: string; posicao: string; nivel: number };
    const turmaId = body.turmaId || session.user.activeTeamId;
    if (!turmaId || !body.nome || !body.telefone) {
      return NextResponse.json({ error: "turmaId, nome e telefone são obrigatórios" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      const jogador = await db.jogador.create({
        data: {
          turmaId,
          nome: body.nome,
          telefone: body.telefone,
          email: body.email ?? null,
          posicao: body.posicao as Posicao,
          nivel: body.nivel,
          ativo: true,
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
      }, { status: 201 });
    }

    const jogador = createJogador({ ...body, turmaId });
    return NextResponse.json(jogador, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
