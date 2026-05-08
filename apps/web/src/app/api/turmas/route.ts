import { NextRequest, NextResponse } from "next/server";
import { createTurma } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { nome: string; local?: string; diaSemana: number; horario: string; mensalidade: number };
    if (!body.nome) return NextResponse.json({ error: "nome obrigatorio" }, { status: 400 });
    const turma = createTurma(body);
    return NextResponse.json(turma, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
