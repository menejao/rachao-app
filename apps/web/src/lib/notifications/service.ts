import type { NotificationContext, NotificationResult, TemplateKey, TemplateVariables, WhatsAppProvider } from "./types";
import { getTemplate } from "./templates";

export function isWhatsAppConfigured(): boolean {
  return !!(process.env.META_WA_PHONE_NUMBER_ID && process.env.META_WA_ACCESS_TOKEN);
}

async function getProvider(): Promise<WhatsAppProvider> {
  const provider = process.env.WHATSAPP_PROVIDER ?? "meta";
  if (provider === "meta") {
    const { MetaWhatsAppProvider } = await import("./providers/meta");
    return new MetaWhatsAppProvider();
  }
  throw new Error(`Unknown WHATSAPP_PROVIDER: ${provider}`);
}

export async function sendNotification<K extends TemplateKey>(
  tipo: K,
  toPhone: string,
  data: TemplateVariables[K],
  ctx: NotificationContext = {}
): Promise<NotificationResult> {
  const template = getTemplate(tipo);
  const variables = template.variables(data);

  if (!isWhatsAppConfigured()) {
    console.warn("[notifications] WhatsApp not configured — skipping send");
    return { ok: false, error: "WhatsApp não configurado" };
  }

  const provider = await getProvider();
  const providerName = process.env.WHATSAPP_PROVIDER ?? "meta";

  let result: NotificationResult;
  try {
    result = await provider.send(toPhone, template.metaTemplateName, variables, template.language);
  } catch (e) {
    result = { ok: false, error: (e as Error).message };
  }

  if (ctx.logToDb !== false && process.env.DATABASE_URL) {
    try {
      const { db } = await import("@/lib/prisma");
      await db.notificationLog.create({
        data: {
          turmaId: ctx.turmaId ?? null,
          userId: ctx.userId ?? null,
          tipo,
          canal: "WHATSAPP",
          provider: providerName,
          toPhone,
          templateName: template.metaTemplateName,
          payload: { variables } as object,
          status: result.ok ? "SENT" : "FAILED",
          providerMsgId: result.providerMsgId ?? null,
          errorMessage: result.error ?? null,
          sentAt: result.ok ? new Date() : null,
        },
      });
    } catch (logErr) {
      console.error("[notifications] Failed to log notification:", logErr);
    }
  }

  return result;
}

export async function sendTextNotification(
  toPhone: string,
  text: string,
  ctx: NotificationContext = {}
): Promise<NotificationResult> {
  if (!isWhatsAppConfigured()) {
    return { ok: false, error: "WhatsApp não configurado" };
  }

  const provider = await getProvider();
  const providerName = process.env.WHATSAPP_PROVIDER ?? "meta";

  let result: NotificationResult;
  try {
    result = await provider.sendText(toPhone, text);
  } catch (e) {
    result = { ok: false, error: (e as Error).message };
  }

  if (ctx.logToDb !== false && process.env.DATABASE_URL) {
    try {
      const { db } = await import("@/lib/prisma");
      await db.notificationLog.create({
        data: {
          turmaId: ctx.turmaId ?? null,
          userId: ctx.userId ?? null,
          tipo: "aviso_generico",
          canal: "WHATSAPP",
          provider: providerName,
          toPhone,
          payload: { text } as object,
          status: result.ok ? "SENT" : "FAILED",
          providerMsgId: result.providerMsgId ?? null,
          errorMessage: result.error ?? null,
          sentAt: result.ok ? new Date() : null,
        },
      });
    } catch (logErr) {
      console.error("[notifications] Failed to log notification:", logErr);
    }
  }

  return result;
}
