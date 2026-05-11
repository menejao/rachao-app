import type { TemplateKey, TemplateVariables } from "./types";

interface TemplateDefinition<K extends TemplateKey> {
  metaTemplateName: string;
  language: string;
  variables: (data: TemplateVariables[K]) => string[];
  fallbackText: (data: TemplateVariables[K]) => string;
}

type Templates = { [K in TemplateKey]: TemplateDefinition<K> };

export const TEMPLATES: Templates = {
  lembrete_jogo: {
    metaTemplateName: "rachao_lembrete_jogo",
    language: "pt_BR",
    variables: (d) => [d.nome, d.equipe, d.data, d.hora, d.local, d.link],
    fallbackText: (d) =>
      `Oi ${d.nome}! Tem jogo da equipe *${d.equipe}* amanhã, ${d.data} às ${d.hora} em ${d.local}. Confirme sua presença: ${d.link} 🏃`,
  },
  cobranca_mensalidade: {
    metaTemplateName: "rachao_cobranca_mensalidade",
    language: "pt_BR",
    variables: (d) => [d.nome, d.valor, d.mes, d.ano, d.equipe],
    fallbackText: (d) =>
      `Oi ${d.nome}, seu pagamento de ${d.valor} (ref. ${d.mes}/${d.ano}) da equipe *${d.equipe}* está pendente. Pode regularizar? 🙏`,
  },
  convite_jogador: {
    metaTemplateName: "rachao_convite_jogador",
    language: "pt_BR",
    variables: (d) => [d.nome, d.equipe, d.link],
    fallbackText: (d) =>
      `Oi ${d.nome}! Você foi convidado para a equipe *${d.equipe}* no Rachão. Acesse: ${d.link}`,
  },
  cancelamento: {
    metaTemplateName: "rachao_cancelamento",
    language: "pt_BR",
    variables: (d) => [d.nome, d.equipe, d.data],
    fallbackText: (d) =>
      `Oi ${d.nome}, o jogo da equipe *${d.equipe}* de ${d.data} foi *cancelado*. Fique ligado para o próximo! ⚽`,
  },
  horario_alterado: {
    metaTemplateName: "rachao_horario_alterado",
    language: "pt_BR",
    variables: (d) => [d.nome, d.equipe, d.data, d.hora, d.local],
    fallbackText: (d) =>
      `Oi ${d.nome}, o horário do jogo da equipe *${d.equipe}* foi alterado. Novo horário: ${d.data} às ${d.hora} em ${d.local}.`,
  },
  lista_espera_promovida: {
    metaTemplateName: "rachao_lista_espera_promovida",
    language: "pt_BR",
    variables: (d) => [d.nome, d.equipe, d.data, d.hora],
    fallbackText: (d) =>
      `${d.nome}, uma vaga abriu! Você saiu da fila de espera e está confirmado no jogo da equipe *${d.equipe}* em ${d.data} às ${d.hora}. Vamos lá! 🎉`,
  },
  aviso_generico: {
    metaTemplateName: "rachao_aviso_generico",
    language: "pt_BR",
    variables: (d) => [d.nome, d.mensagem],
    fallbackText: (d) => `Oi ${d.nome}! *Rachão:* ${d.mensagem}`,
  },
};

export function getTemplate<K extends TemplateKey>(key: K): TemplateDefinition<K> {
  return TEMPLATES[key] as TemplateDefinition<K>;
}
