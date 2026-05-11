import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createInvite } from "@/lib/store";
import { CreateInviteSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    const parsed = CreateInviteSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });
    const body = parsed.data;
    const turmaId = body.turmaId || session.user.activeTeamId;
    const role = body.role ?? "PLAYER";

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const invite = await db.invite.create({
        data: {
          turmaId,
          createdById: session.user.id,
          role,
          expiresAt,
        },
        include: { turma: true },
      });
      return NextResponse.json({
        id: invite.id,
        token: invite.token,
        turmaId: invite.turmaId,
        turmaNome: invite.turma.nome,
        role: invite.role,
        expiresAt: invite.expiresAt.toISOString(),
      });
    }

    const invite = createInvite(turmaId, role);
    return NextResponse.json(invite);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
