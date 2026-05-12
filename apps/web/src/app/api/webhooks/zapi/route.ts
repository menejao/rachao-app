import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handlePresenceWebhook } from "@/lib/webhook-presence";
import { handleActivationWebhook, isActivationCommand } from "@/lib/webhook-activation";

const zapiSchema = z.object({
  isGroup: z.boolean().optional(),
  fromMe: z.boolean().optional(),
  phone: z.string(),
  participantPhone: z.string().optional(),
  text: z.object({ message: z.string() }).optional(),
  chatName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const raw: unknown = await req.json();
    const parsed = zapiSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Payload inválido" });
    }

    const data = parsed.data;

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

    // Update last activity for known groups
    void import("@/lib/prisma").then(({ db }) =>
      db.turma.updateMany({
        where: { whatsappGroupId: data.phone },
        data: { whatsappLastActivity: new Date() },
      }).catch(() => null)
    );

    if (isActivationCommand(message)) {
      const result = await handleActivationWebhook({
        groupId: data.phone,
        groupName: data.chatName,
        message,
      });
      return NextResponse.json(result);
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
