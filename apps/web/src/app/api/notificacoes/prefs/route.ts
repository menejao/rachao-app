import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { NotifPrefsSchema } from "@/lib/schemas";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });
    }

    const parsed = NotifPrefsSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });
    const body = parsed.data;
    const { db } = await import("@/lib/prisma");

    const prefs = await db.userNotificationPreference.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        whatsappEnabled: body.whatsappEnabled ?? true,
        paymentReminderEnabled: body.paymentReminderEnabled ?? true,
        gameReminderEnabled: body.gameReminderEnabled ?? true,
        presenceReminderEnabled: body.presenceReminderEnabled ?? true,
      },
      update: {
        ...(body.whatsappEnabled !== undefined && { whatsappEnabled: body.whatsappEnabled }),
        ...(body.paymentReminderEnabled !== undefined && { paymentReminderEnabled: body.paymentReminderEnabled }),
        ...(body.gameReminderEnabled !== undefined && { gameReminderEnabled: body.gameReminderEnabled }),
        ...(body.presenceReminderEnabled !== undefined && { presenceReminderEnabled: body.presenceReminderEnabled }),
      },
    });

    return NextResponse.json(prefs);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
