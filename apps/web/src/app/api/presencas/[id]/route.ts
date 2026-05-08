import { NextRequest, NextResponse } from "next/server";
import type { RespostaPresenca } from "@rachao/types";
import { updatePresenca } from "@/lib/store";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json() as { resposta: RespostaPresenca };
    if (!body.resposta) return NextResponse.json({ error: "resposta obrigatoria" }, { status: 400 });
    updatePresenca(id, body.resposta);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
