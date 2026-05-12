const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateActivationCode(): string {
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return `RACHAO-${suffix}`;
}
