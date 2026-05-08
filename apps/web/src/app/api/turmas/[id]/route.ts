import { NextRequest, NextResponse } from "next/server";
import { updateTurma } from "@/lib/store";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json() as Parameters<typeof updateTurma>[1];
    const turma = updateTurma(id, body);
    return NextResponse.json(turma);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
