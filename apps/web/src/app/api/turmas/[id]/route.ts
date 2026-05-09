import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateTurma } from "@/lib/store";
import type { TurmaStatus } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const { id } = await params;
    const body = await req.json() as Record<string, unknown>;

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      const turma = await db.turma.update({
        where: { id },
        data: {
          ...(body.nome !== undefined && { nome: body.nome as string }),
          ...(body.local !== undefined && { local: body.local as string | null }),
          ...(body.diaSemana !== undefined && { diaSemana: body.diaSemana as number }),
          ...(body.horario !== undefined && { horario: body.horario as string }),
          ...(body.mensalidade !== undefined && { mensalidade: body.mensalidade as number }),
          ...(body.status !== undefined && { status: body.status as TurmaStatus }),
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
      });
    }

    const turma = updateTurma(id, body as Parameters<typeof updateTurma>[1]);
    return NextResponse.json(turma);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
