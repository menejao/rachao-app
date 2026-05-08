import { NextRequest, NextResponse } from "next/server";
import { createJogador } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { turmaId: string; nome: string; telefone: string; email?: string; posicao: string; nivel: number };
    if (!body.turmaId || !body.nome || !body.telefone) {
      return NextResponse.json({ error: "turmaId, nome e telefone sao obrigatorios" }, { status: 400 });
    }
    const jogador = createJogador(body);
    return NextResponse.json(jogador, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
