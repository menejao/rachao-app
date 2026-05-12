import { zapiSendText } from "./zapi-sender";

export function isActivationCommand(message: string): boolean {
  return /^\/ativar\s+/i.test(message.trim());
}

export async function handleActivationWebhook(input: {
  groupId: string;
  groupName?: string;
  message: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const match = input.message.trim().match(/^\/ativar\s+([A-Z0-9-]+)$/i);
  if (!match) {
    return { ok: false, reason: "Formato inválido. Use: /ativar RACHAO-XXXX" };
  }

  const code = match[1].toUpperCase();
  const { db } = await import("@/lib/prisma");

  const turma = await db.turma.findFirst({
    where: { whatsappActivationCode: code },
  });

  if (!turma) {
    await zapiSendText(
      input.groupId,
      "❌ Código inválido. Verifique o código em Configurações → WhatsApp do Rachão."
    );
    return { ok: false, reason: "Código não encontrado" };
  }

  if (turma.whatsappGroupId && turma.whatsappGroupId !== input.groupId) {
    await zapiSendText(
      input.groupId,
      "⚠️ Este código já está vinculado a outro grupo. Gere um novo código nas configurações."
    );
    return { ok: false, reason: "Código já usado em outro grupo" };
  }

  await db.turma.update({
    where: { id: turma.id },
    data: {
      whatsappGroupId: input.groupId,
      whatsappGroupName: input.groupName ?? null,
      whatsappStatus: "CONECTADO",
      whatsappConnectedAt: new Date(),
      whatsappLastActivity: new Date(),
    },
  });

  await db.eventoLog.create({
    data: {
      tipo: "whatsapp.group.activated",
      origem: "webhook",
      turmaId: turma.id,
      payload: { groupId: input.groupId, groupName: input.groupName, code },
    },
  });

  await zapiSendText(
    input.groupId,
    `✅ Grupo conectado ao Rachão: ${turma.nome}\n\nAgora eu processo as respostas de presença automaticamente. Para testar, envie: SIM`
  );

  return { ok: true };
}
