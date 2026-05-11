import { z } from "zod";
import type { PresenceWebhookInput } from "@rachao/types";

// ---------------------------------------------------------------------------
// Z-API — payload bruto de mensagem recebida em grupo
// Doc: https://developer.z-api.io/en/hooks/on-message-received
// ---------------------------------------------------------------------------
// Exemplo de payload:
// {
//   "isGroup": true,
//   "phone": "5511988887777-1609946707@g.us",
//   "participantPhone": "5511988887777",
//   "senderName": "João",
//   "fromMe": false,
//   "type": "ReceivedCallback",
//   "text": { "message": "SIM" }
// }

export const zapiWebhookSchema = z.object({
  isGroup: z.boolean().optional(),
  fromMe: z.boolean().optional(),
  phone: z.string(),
  participantPhone: z.string().optional(),
  senderName: z.string().optional(),
  type: z.string().optional(),
  text: z.object({ message: z.string() }).optional(),
});

export type ZApiWebhookPayload = z.infer<typeof zapiWebhookSchema>;

export function adaptZApiWebhook(raw: unknown): PresenceWebhookInput | null {
  const parsed = zapiWebhookSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn("[zapi-adapter] invalid payload:", parsed.error.issues);
    return null;
  }

  const data = parsed.data;

  // Ignorar mensagens enviadas pelo próprio bot e não-grupos
  if (data.fromMe || !data.isGroup) return null;

  const message = data.text?.message?.trim();
  if (!message) return null;

  // Em grupos, phone é o JID do grupo; participantPhone é o remetente
  const fromPhone = data.participantPhone ?? "";

  return {
    provider: "zapi",
    groupId: data.phone,
    fromPhone,
    message,
  };
}

// ---------------------------------------------------------------------------
// Evolution API — payload bruto de mensagem recebida
// Evento: messages.upsert
// Doc: https://doc.evolution-api.com/v2/pt/webhooks/events
// ---------------------------------------------------------------------------
// Exemplo de payload:
// {
//   "event": "messages.upsert",
//   "instance": "rachao",
//   "data": {
//     "key": { "remoteJid": "5511988887777-1609946707@g.us", "fromMe": false, "id": "XXXX" },
//     "pushName": "João",
//     "message": { "conversation": "SIM" },
//     "participant": "5511988887777@s.whatsapp.net",
//     "messageType": "conversation",
//     "messageTimestamp": 1700000000
//   }
// }

export const evolutionWebhookSchema = z.object({
  event: z.string(),
  instance: z.string().optional(),
  data: z.object({
    key: z.object({
      remoteJid: z.string(),
      fromMe: z.boolean(),
      id: z.string(),
    }),
    pushName: z.string().optional(),
    participant: z.string().optional(),
    message: z
      .object({
        conversation: z.string().optional(),
        extendedTextMessage: z.object({ text: z.string() }).optional(),
      })
      .optional(),
    messageType: z.string().optional(),
  }),
});

export type EvolutionWebhookPayload = z.infer<typeof evolutionWebhookSchema>;

export function adaptEvolutionWebhook(raw: unknown): PresenceWebhookInput | null {
  const parsed = evolutionWebhookSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn("[evolution-adapter] invalid payload:", parsed.error.issues);
    return null;
  }

  const data = parsed.data;

  // Processar somente mensagens recebidas
  if (data.event !== "messages.upsert") return null;
  if (data.data.key.fromMe) return null;

  // Só grupos — JID de grupo termina em @g.us
  const remoteJid = data.data.key.remoteJid;
  if (!remoteJid.endsWith("@g.us")) return null;

  const message = (
    data.data.message?.conversation ??
    data.data.message?.extendedTextMessage?.text ??
    ""
  ).trim();
  if (!message) return null;

  // Participante: "5511XXXXXXXXX@s.whatsapp.net" → strip @s.whatsapp.net
  const rawParticipant = data.data.participant ?? "";
  const fromPhone = rawParticipant.replace(/@s\.whatsapp\.net$/, "");

  return {
    provider: "evolution",
    groupId: remoteJid,
    fromPhone,
    message,
  };
}
