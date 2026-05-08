import { NextRequest, NextResponse } from "next/server";
import { createJogo } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { turmaId: string; dataJogo: string };
    if (!body.turmaId || !body.dataJogo) {
      return NextResponse.json({ error: "turmaId e dataJogo sao obrigatorios" }, { status: 400 });
    }
    const jogo = createJogo(body);
    return NextResponse.json(jogo, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
