import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateActivationCode } from "@/lib/activation-code";
import { revalidateDashboard } from "@/lib/dashboard-data";
import type { TurmaSummary, WhatsappConnectionStatus } from "@rachao/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const { id } = await params;
    const { action } = (await req.json()) as { action: string };

    if (!process.env.DATABASE_URL) {
      const code = generateActivationCode();
      return NextResponse.json({ ok: true, code });
    }

    const { db } = await import("@/lib/prisma");

    if (action === "desconectar") {
      const turma = await db.turma.update({
        where: { id },
        data: {
          whatsappGroupId: null,
          whatsappGroupName: null,
          whatsappStatus: "NAO_CONECTADO",
          whatsappConnectedAt: null,
          whatsappLastActivity: null,
        },
      });
      revalidateDashboard(session.user.id);
      return NextResponse.json({ ok: true, turma: mapTurma(turma) });
    }

    if (action === "novo-codigo") {
      const current = await db.turma.findUnique({ where: { id }, select: { whatsappStatus: true } });
      const code = generateActivationCode();
      const turma = await db.turma.update({
        where: { id },
        data: {
          whatsappActivationCode: code,
          whatsappStatus: current?.whatsappStatus === "CONECTADO" ? "CONECTADO" : "AGUARDANDO",
        },
      });
      revalidateDashboard(session.user.id);
      return NextResponse.json({ ok: true, turma: mapTurma(turma) });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

function mapTurma(t: {
  id: string; nome: string; whatsappStatus: string;
  whatsappActivationCode: string | null; whatsappGroupId: string | null;
  whatsappGroupName: string | null; whatsappConnectedAt: Date | null;
  whatsappLastActivity: Date | null;
}): Partial<TurmaSummary> {
  return {
    id: t.id,
    nome: t.nome,
    whatsappStatus: t.whatsappStatus as WhatsappConnectionStatus,
    whatsappActivationCode: t.whatsappActivationCode,
    whatsappGroupId: t.whatsappGroupId,
    whatsappGroupName: t.whatsappGroupName,
    whatsappConnectedAt: t.whatsappConnectedAt?.toISOString() ?? null,
    whatsappLastActivity: t.whatsappLastActivity?.toISOString() ?? null,
  };
}
