import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handlePresenceWebhook } from "@/lib/webhook-presence";

const zapiSchema = z.object({
  isGroup: z.boolean().optional(),
  fromMe: z.boolean().optional(),
  phone: z.string(),
  participantPhone: z.string().optional(),
  text: z.object({ message: z.string() }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const raw: unknown = await req.json();
    console.log("[ZAPI_WEBHOOK_RAW]", JSON.stringify(raw, null, 2));
    const parsed = zapiSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Payload inválido" });
    }

    const data = parsed.data;

    // Ignorar mensagens próprias e não-grupos
    if (data.fromMe || !data.isGroup) {
      return NextResponse.json({ ok: true, ignored: true, reason: "fromMe ou não é grupo" });
    }

    const message = data.text?.message?.trim();
    if (!message) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Sem texto" });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Sem banco" });
    }

    const result = await handlePresenceWebhook({
      groupId: data.phone,
      fromPhone: data.participantPhone ?? "",
      message,
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("[webhook/zapi]", e);
    return NextResponse.json({ ok: true }); // sempre 200 para não reenviar
  }
}
