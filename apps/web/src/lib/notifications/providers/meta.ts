import type { NotificationResult, WhatsAppProvider } from "../types";

export class MetaWhatsAppProvider implements WhatsAppProvider {
  private phoneNumberId: string;
  private token: string;

  constructor() {
    this.phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID ?? "";
    this.token = process.env.META_WA_ACCESS_TOKEN ?? "";
  }

  async send(to: string, templateName: string, variables: string[], language: string): Promise<NotificationResult> {
    const phone = normalizePhone(to);
    const body = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components: variables.length > 0
          ? [{ type: "body", parameters: variables.map((v) => ({ type: "text", text: v })) }]
          : [],
      },
    };

    try {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const json = await res.json() as { messages?: { id: string }[]; error?: { message: string } };

      if (!res.ok || json.error) {
        return { ok: false, error: json.error?.message ?? `HTTP ${res.status}` };
      }

      return { ok: true, providerMsgId: json.messages?.[0]?.id };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  async sendText(to: string, text: string): Promise<NotificationResult> {
    const phone = normalizePhone(to);
    const body = {
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: text },
    };

    try {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const json = await res.json() as { messages?: { id: string }[]; error?: { message: string } };

      if (!res.ok || json.error) {
        return { ok: false, error: json.error?.message ?? `HTTP ${res.status}` };
      }

      return { ok: true, providerMsgId: json.messages?.[0]?.id };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}
