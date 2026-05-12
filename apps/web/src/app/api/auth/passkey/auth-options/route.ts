import { NextRequest, NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

export async function POST(req: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB não configurado." }, { status: 400 });

  const { db } = await import("@/lib/prisma");
  const { email } = (await req.json()) as { email?: string };

  const origin = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const rpID = new URL(origin).hostname;

  let allowCredentials: { id: Buffer; type: "public-key" }[] | undefined;
  let userId: string | undefined;

  if (email) {
    const user = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (user) {
      userId = user.id;
      const passkeys = await db.passkey.findMany({
        where: { userId: user.id },
        select: { credentialId: true },
      });
      if (passkeys.length === 0) {
        return NextResponse.json({ error: "Sem chave biométrica cadastrada para este email." }, { status: 404 });
      }
      allowCredentials = passkeys.map((p) => ({
        id: Buffer.from(p.credentialId, "base64url"),
        type: "public-key" as const,
      }));
    } else {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }
  }

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials,
  });

  if (userId) {
    await db.user.update({ where: { id: userId }, data: { passkeyChallenge: options.challenge } });
  }

  return NextResponse.json(options);
}
