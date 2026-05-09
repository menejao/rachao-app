import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createTurma } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const body = await req.json() as { nome: string; local?: string; diaSemana: number; horario: string; mensalidade: number };
    if (!body.nome) return NextResponse.json({ error: "nome obrigatório" }, { status: 400 });

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      const turma = await db.turma.create({
        data: {
          nome: body.nome,
          local: body.local ?? null,
          diaSemana: body.diaSemana,
          horario: body.horario,
          mensalidade: body.mensalidade,
          status: "ATIVA",
          memberships: {
            create: { userId: session.user.id, role: "ADMIN" },
          },
        },
      });
      return NextResponse.json({
        id: turma.id,
        nome: turma.nome,
        local: turma.local,
        diaSemana: turma.diaSemana,
        horario: turma.horario,
        mensalidade: Number(turma.mensalidade),
        status: turma.status,
      }, { status: 201 });
    }

    const turma = createTurma(body);
    return NextResponse.json(turma, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
