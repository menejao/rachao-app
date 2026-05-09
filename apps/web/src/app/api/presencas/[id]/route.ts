import { NextRequest, NextResponse } from "next/server";
import type { RespostaPresenca } from "@rachao/types";
import { auth } from "@/auth";
import { updatePresenca } from "@/lib/store";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const { id } = await params;
    const body = await req.json() as { resposta: RespostaPresenca };
    if (!body.resposta) return NextResponse.json({ error: "resposta obrigatória" }, { status: 400 });

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      await db.presenca.update({
        where: { id },
        data: { resposta: body.resposta, respondeuEm: new Date() },
      });
      return NextResponse.json({ ok: true });
    }

    updatePresenca(id, body.resposta);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
