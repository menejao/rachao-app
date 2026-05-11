import type { WhatsAppProvider } from "@rachao/types";

export interface WhatsAppSendInput {
  provider: WhatsAppProvider;
  groupId: string;
  message: string;
}

export interface WhatsAppSendResult {
  providerMessageId: string;
  echoed: boolean;
  mode: "dry-run" | "production";
}

export interface WhatsAppSender {
  sendGroupMessage(input: WhatsAppSendInput): Promise<WhatsAppSendResult>;
}

function getDeliveryMode(): "dry-run" | "production" {
  return process.env.WHATSAPP_DELIVERY_MODE === "production" ? "production" : "dry-run";
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 10_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export class MockWhatsAppSender implements WhatsAppSender {
  async sendGroupMessage() {
    return {
      providerMessageId: `mock-${Date.now()}`,
      echoed: true,
      mode: getDeliveryMode(),
    };
  }
}

export class ZApiWhatsAppSender implements WhatsAppSender {
  async sendGroupMessage(input: WhatsAppSendInput): Promise<WhatsAppSendResult> {
    const mode = getDeliveryMode();

    if (mode !== "production") {
      console.log(`[zapi] dry-run → groupId=${input.groupId}`);
      return { providerMessageId: `zapi-dry-run-${input.groupId}`, echoed: true, mode };
    }

    const instanceId = process.env.ZAPI_INSTANCE_ID;
    const token = process.env.ZAPI_TOKEN;
    if (!instanceId || !token) {
      throw new Error("ZAPI_INSTANCE_ID and ZAPI_TOKEN are required when WHATSAPP_DELIVERY_MODE=production");
    }

    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;

    let response: Response;
    try {
      response = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: input.groupId, message: input.message }),
      });
    } catch (err) {
      console.error("[zapi] network error:", err);
      throw new Error(`Z-API network error: ${String(err)}`);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`[zapi] HTTP ${response.status}: ${body}`);
      throw new Error(`Z-API HTTP ${response.status}: ${body}`);
    }

    const data = (await response.json()) as { messageId?: string };
    const providerMessageId = data.messageId ?? `zapi-${Date.now()}`;
    console.log(`[zapi] sent ${providerMessageId} → ${input.groupId}`);

    return { providerMessageId, echoed: false, mode };
  }
}

export class EvolutionWhatsAppSender implements WhatsAppSender {
  async sendGroupMessage(input: WhatsAppSendInput): Promise<WhatsAppSendResult> {
    const mode = getDeliveryMode();

    if (mode !== "production") {
      console.log(`[evolution] dry-run → groupId=${input.groupId}`);
      return { providerMessageId: `evolution-dry-run-${input.groupId}`, echoed: true, mode };
    }

    const apiUrl = process.env.EVOLUTION_API_URL;
    const instance = process.env.EVOLUTION_INSTANCE;
    const apiKey = process.env.EVOLUTION_API_KEY;
    if (!apiUrl || !instance || !apiKey) {
      throw new Error(
        "EVOLUTION_API_URL, EVOLUTION_INSTANCE, and EVOLUTION_API_KEY are required when WHATSAPP_DELIVERY_MODE=production"
      );
    }

    const url = `${apiUrl}/message/sendText/${instance}`;

    let response: Response;
    try {
      response = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: apiKey },
        body: JSON.stringify({ number: input.groupId, text: input.message }),
      });
    } catch (err) {
      console.error("[evolution] network error:", err);
      throw new Error(`Evolution network error: ${String(err)}`);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`[evolution] HTTP ${response.status}: ${body}`);
      throw new Error(`Evolution HTTP ${response.status}: ${body}`);
    }

    const data = (await response.json()) as { key?: { id?: string } };
    const providerMessageId = data.key?.id ?? `evolution-${Date.now()}`;
    console.log(`[evolution] sent ${providerMessageId} → ${input.groupId}`);

    return { providerMessageId, echoed: false, mode };
  }
}

export function makeWhatsAppSender(provider: WhatsAppProvider): WhatsAppSender {
  if (provider === "evolution") return new EvolutionWhatsAppSender();
  if (provider === "zapi") return new ZApiWhatsAppSender();
  return new MockWhatsAppSender();
}
