import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

async function verifySignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.META_WA_APP_SECRET;
  if (!secret) return true;
  const signature = req.headers.get("x-hub-signature-256");
  if (!signature) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// Meta webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WA_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

interface StatusUpdate {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  errors?: { message: string }[];
}

interface WebhookBody {
  object: string;
  entry?: {
    changes?: {
      value?: {
        statuses?: StatusUpdate[];
      };
    }[];
  }[];
}

// Meta delivery status events
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    if (!await verifySignature(req, rawBody)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = JSON.parse(rawBody) as WebhookBody;

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ ok: true });
    }

    if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true });

    const { db } = await import("@/lib/prisma");

    const statuses: StatusUpdate[] = [];
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        for (const s of change.value?.statuses ?? []) {
          statuses.push(s);
        }
      }
    }

    for (const s of statuses) {
      const updateData: Record<string, unknown> = { status: s.status.toUpperCase() };
      if (s.status === "sent") updateData.sentAt = new Date(Number(s.timestamp) * 1000);
      if (s.status === "delivered") updateData.deliveredAt = new Date(Number(s.timestamp) * 1000);
      if (s.status === "read") updateData.readAt = new Date(Number(s.timestamp) * 1000);
      if (s.status === "failed") updateData.errorMessage = s.errors?.[0]?.message ?? "failed";

      await db.notificationLog.updateMany({
        where: { providerMsgId: s.id },
        data: updateData,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[webhook/whatsapp]", e);
    return NextResponse.json({ ok: true }); // always 200 to Meta
  }
}
