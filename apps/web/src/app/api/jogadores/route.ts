import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createJogador } from "@/lib/store";
import { CreateJogadorSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const parsed = CreateJogadorSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });
    const body = parsed.data;
    const turmaId = body.turmaId || session.user.activeTeamId;
    if (!turmaId) {
      return NextResponse.json({ error: "turmaId obrigatório" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      const jogador = await db.jogador.create({
        data: {
          turmaId,
          nome: body.nome,
          telefone: body.telefone,
          email: body.email ?? null,
          posicao: body.posicao,
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
