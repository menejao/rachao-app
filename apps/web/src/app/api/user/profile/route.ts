import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { updateUserProfile } from "@/lib/store";

const schema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    const user = updateUserProfile(session.user.id, parsed.data);
    return NextResponse.json({ ok: true, name: user.name, phone: user.phone });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
