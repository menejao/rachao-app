import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { verifyRegistrationResponse } from "@simplewebauthn/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB não configurado." }, { status: 400 });

  const { db } = await import("@/lib/prisma");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passkeyChallenge: true },
  });
  if (!user?.passkeyChallenge) {
    return NextResponse.json({ error: "Challenge expirado." }, { status: 400 });
  }

  const body = await req.json();
  const origin = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const rpID = new URL(origin).hostname;

  let result;
  try {
    result = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: user.passkeyChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch {
    await db.user.update({ where: { id: session.user.id }, data: { passkeyChallenge: null } });
    return NextResponse.json({ error: "Verificação falhou." }, { status: 400 });
  }

  await db.user.update({ where: { id: session.user.id }, data: { passkeyChallenge: null } });

  if (!result.verified || !result.registrationInfo) {
    return NextResponse.json({ error: "Verificação falhou." }, { status: 400 });
  }

  const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } =
    result.registrationInfo;

  await db.passkey.create({
    data: {
      userId: session.user.id,
      credentialId: Buffer.from(credentialID).toString("base64url"),
      publicKey: Buffer.from(credentialPublicKey),
      counter: BigInt(counter),
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: JSON.stringify(body.response?.transports ?? []),
    },
  });

  return NextResponse.json({ ok: true });
}
