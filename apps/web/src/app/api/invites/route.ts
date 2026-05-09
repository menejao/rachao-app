import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createInvite } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }
    const body = await req.json() as { role?: "ADMIN" | "PLAYER" };
    const invite = createInvite(session.user.activeTeamId, body.role ?? "PLAYER");
    return NextResponse.json(invite);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
