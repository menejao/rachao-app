import { createHmac } from "crypto";

function secret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-secret";
}

export function createPasskeyToken(userId: string): string {
  const exp = Date.now() + 60_000;
  const payload = `${userId}.${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyPasskeyToken(token: string): string | null {
  try {
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return null;
    const payload = token.slice(0, lastDot);
    const sig = token.slice(lastDot + 1);
    const dotIdx = payload.indexOf(".");
    if (dotIdx === -1) return null;
    const userId = payload.slice(0, dotIdx);
    const exp = Number(payload.slice(dotIdx + 1));
    if (isNaN(exp) || Date.now() > exp) return null;
    const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
    if (sig !== expected) return null;
    return userId;
  } catch {
    return null;
  }
}
