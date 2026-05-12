import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { createPasskeyToken } from "@/lib/passkey-token";

export async function POST(req: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB não configurado." }, { status: 400 });

  const { db } = await import("@/lib/prisma");
  const body = await req.json();

  const credentialId: string = body.id;
  const passkey = await db.passkey.findUnique({ where: { credentialId } });
  if (!passkey) return NextResponse.json({ error: "Chave não encontrada." }, { status: 404 });

  const user = await db.user.findUnique({
    where: { id: passkey.userId },
    select: { id: true, passkeyChallenge: true },
  });
  if (!user?.passkeyChallenge) {
    return NextResponse.json({ error: "Challenge expirado." }, { status: 400 });
  }

  const origin = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const rpID = new URL(origin).hostname;

  let result;
  try {
    result = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: user.passkeyChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: new Uint8Array(Buffer.from(passkey.credentialId, "base64url")),
        credentialPublicKey: new Uint8Array(passkey.publicKey as Buffer),
        counter: Number(passkey.counter),
        transports: JSON.parse(passkey.transports ?? "[]"),
      },
    });
  } catch {
    await db.user.update({ where: { id: user.id }, data: { passkeyChallenge: null } });
    return NextResponse.json({ error: "Verificação falhou." }, { status: 400 });
  }

  await db.user.update({ where: { id: user.id }, data: { passkeyChallenge: null } });

  if (!result.verified) {
    return NextResponse.json({ error: "Autenticação inválida." }, { status: 401 });
  }

  await db.passkey.update({
    where: { id: passkey.id },
    data: { counter: BigInt(result.authenticationInfo.newCounter) },
  });

  const token = createPasskeyToken(user.id);
  return NextResponse.json({ ok: true, token });
}
