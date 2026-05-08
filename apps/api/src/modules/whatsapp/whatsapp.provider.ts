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

export class MockWhatsAppSender implements WhatsAppSender {
  async sendGroupMessage() {
    return {
      providerMessageId: `mock-${Date.now()}`,
      echoed: true,
      mode: getDeliveryMode(),
    };
  }
}

export class EvolutionWhatsAppSender implements WhatsAppSender {
  async sendGroupMessage(input: WhatsAppSendInput) {
    const mode = getDeliveryMode();

    return {
      providerMessageId:
        mode === "production" ? `evolution-prod-${Date.now()}` : `evolution-dry-run-${input.groupId}`,
      echoed: mode !== "production",
      mode,
    };
  }
}

export class ZApiWhatsAppSender implements WhatsAppSender {
  async sendGroupMessage(input: WhatsAppSendInput) {
    const mode = getDeliveryMode();

    return {
      providerMessageId:
        mode === "production" ? `zapi-prod-${Date.now()}` : `zapi-dry-run-${input.groupId}`,
      echoed: mode !== "production",
      mode,
    };
  }
}

export function makeWhatsAppSender(provider: WhatsAppProvider): WhatsAppSender {
  if (provider === "evolution") return new EvolutionWhatsAppSender();
  if (provider === "zapi") return new ZApiWhatsAppSender();
  return new MockWhatsAppSender();
}
