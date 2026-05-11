import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handlePresenceWebhook } from "@/lib/webhook-presence";

const evolutionSchema = z.object({
  event: z.string(),
  data: z.object({
    key: z.object({
      remoteJid: z.string(),
      fromMe: z.boolean(),
    }),
    participant: z.string().optional(),
    message: z
      .object({
        conversation: z.string().optional(),
        extendedTextMessage: z.object({ text: z.string() }).optional(),
      })
      .optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const raw: unknown = await req.json();
    const parsed = evolutionSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Payload inválido" });
    }

    const data = parsed.data;

    if (data.event !== "messages.upsert") {
      return NextResponse.json({ ok: true, ignored: true, reason: `Evento ignorado: ${data.event}` });
    }

    if (data.data.key.fromMe) {
      return NextResponse.json({ ok: true, ignored: true, reason: "fromMe" });
    }

    const remoteJid = data.data.key.remoteJid;
    if (!remoteJid.endsWith("@g.us")) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Não é grupo" });
    }

    const message = (
      data.data.message?.conversation ??
      data.data.message?.extendedTextMessage?.text ??
      ""
    ).trim();

    if (!message) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Sem texto" });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Sem banco" });
    }

    // "5511XXXXXXXXX@s.whatsapp.net" → "5511XXXXXXXXX"
    const fromPhone = (data.data.participant ?? "").replace(/@s\.whatsapp\.net$/, "");

    const result = await handlePresenceWebhook({
      groupId: remoteJid,
      fromPhone,
      message,
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("[webhook/evolution]", e);
    return NextResponse.json({ ok: true }); // sempre 200 para não reenviar
  }
}
