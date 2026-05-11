import { normalizePhone, parsePresenceResponse } from "@rachao/utils";

export interface IncomingWebhookInput {
  groupId: string;
  fromPhone: string;
  message: string;
}

export async function handlePresenceWebhook(input: IncomingWebhookInput) {
  const resposta = parsePresenceResponse(input.message);
  if (!resposta || resposta === "PENDENTE") {
    return { ok: false, ignored: true, reason: "Mensagem não reconhecida como resposta de presença" };
  }

  const { db } = await import("@/lib/prisma");

  const turma = await db.turma.findFirst({
    where: { whatsappGroupId: input.groupId },
  });

  if (!turma) {
    return { ok: false, ignored: true, reason: "Turma não encontrada para este grupo" };
  }

  const jogo = await db.jogo.findFirst({
    where: { turmaId: turma.id, status: "CONFIRMACAO_ABERTA" },
    orderBy: { dataJogo: "asc" },
  });

  if (!jogo) {
    return { ok: false, ignored: true, reason: "Nenhum jogo aberto para esta turma" };
  }

  const normalizedPhone = normalizePhone(input.fromPhone);

  const jogador = await db.jogador.findFirst({
    where: { turmaId: turma.id, telefone: normalizedPhone },
  });

  if (!jogador) {
    return { ok: false, ignored: true, reason: `Jogador não encontrado (tel: ${normalizedPhone})` };
  }

  await db.presenca.upsert({
    where: { jogoId_jogadorId: { jogoId: jogo.id, jogadorId: jogador.id } },
    create: {
      jogoId: jogo.id,
      jogadorId: jogador.id,
      resposta,
      respondeuEm: new Date(),
    },
    update: {
      resposta,
      respondeuEm: new Date(),
    },
  });

  await db.eventoLog.create({
    data: {
      tipo: "presence.response.saved",
      origem: "webhook",
      turmaId: turma.id,
      jogoId: jogo.id,
      jogadorId: jogador.id,
      payload: { fromPhone: input.fromPhone, message: input.message, resposta },
    },
  });

  return { ok: true, jogoId: jogo.id, jogadorId: jogador.id, resposta };
}
