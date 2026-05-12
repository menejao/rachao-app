import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateRegistrationOptions } from "@simplewebauthn/server";

function webAuthnOrigin() {
  return process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB não configurado." }, { status: 400 });

  const { db } = await import("@/lib/prisma");

  const existing = await db.passkey.findMany({
    where: { userId: session.user.id },
    select: { credentialId: true },
  });

  const origin = webAuthnOrigin();
  const rpID = new URL(origin).hostname;

  const options = await generateRegistrationOptions({
    rpName: "Rachão",
    rpID,
    userID: session.user.id,
    userName: session.user.email ?? session.user.id,
    userDisplayName: session.user.name ?? session.user.email ?? "Usuário",
    excludeCredentials: existing.map((p) => ({
      id: Buffer.from(p.credentialId, "base64url"),
      type: "public-key" as const,
    })),
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
  });

  await db.user.update({
    where: { id: session.user.id },
    data: { passkeyChallenge: options.challenge },
  });

  return NextResponse.json(options);
}
