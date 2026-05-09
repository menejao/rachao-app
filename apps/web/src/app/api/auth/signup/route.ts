import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/lib/store";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  teamName: z.string().min(2),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    const { name, email, password, teamName } = parsed.data;

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");
      const { hash } = await import("bcryptjs");

      const existing = await db.user.findUnique({ where: { email } });
      if (existing) return NextResponse.json({ error: "Email já cadastrado." }, { status: 400 });

      const passwordHash = await hash(password, 10);

      const user = await db.user.create({ data: { name, email, passwordHash } });
      const turma = await db.turma.create({
        data: {
          nome: teamName,
          diaSemana: 5,
          horario: "20:00",
          mensalidade: 0,
          memberships: { create: { userId: user.id, role: "ADMIN" } },
        },
      });

      return NextResponse.json({ id: user.id, name: user.name, email: user.email, activeTeamId: turma.id });
    }

    const result = registerUser(name, email, password, teamName);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
