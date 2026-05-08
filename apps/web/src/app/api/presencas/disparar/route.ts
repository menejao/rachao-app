import { NextRequest, NextResponse } from "next/server";
import { dispararPresencas } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { turmaId: string; dataJogo: string };
    if (!body.turmaId || !body.dataJogo) {
      return NextResponse.json({ error: "turmaId e dataJogo obrigatorios" }, { status: 400 });
    }
    const result = dispararPresencas(body.turmaId, body.dataJogo);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
