import { NextRequest, NextResponse } from "next/server";
import { generateTimes } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { jogoId: string };
    if (!body.jogoId) return NextResponse.json({ error: "jogoId obrigatorio" }, { status: 400 });
    const times = generateTimes(body.jogoId);
    return NextResponse.json(times);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
