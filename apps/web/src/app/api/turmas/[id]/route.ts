import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateTurma } from "@/lib/store";
import { UpdateTurmaSchema } from "@/lib/schemas";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const { id } = await params;
    const parsed = UpdateTurmaSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });
    const body = parsed.data;

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      const turma = await db.turma.update({
        where: { id },
        data: {
          ...(body.nome !== undefined && { nome: body.nome }),
          ...(body.local !== undefined && { local: body.local }),
          ...(body.diaSemana !== undefined && { diaSemana: body.diaSemana }),
          ...(body.horario !== undefined && { horario: body.horario }),
          ...(body.mensalidade !== undefined && { mensalidade: body.mensalidade }),
          ...(body.status !== undefined && { status: body.status }),
          ...(body.whatsappGroupId !== undefined && { whatsappGroupId: body.whatsappGroupId }),
          ...(body.whatsappProvider !== undefined && { whatsappProvider: body.whatsappProvider }),
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
        whatsappGroupId: turma.whatsappGroupId,
        whatsappProvider: turma.whatsappProvider,
      });
    }

    const turma = updateTurma(id, body);
    return NextResponse.json(turma);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
