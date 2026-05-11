export type NotificationChannel = "WHATSAPP";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "DELIVERED" | "READ";

export interface NotificationResult {
  ok: boolean;
  providerMsgId?: string;
  error?: string;
}

export interface NotificationContext {
  turmaId?: string;
  userId?: string;
  logToDb?: boolean;
}

export type TemplateKey =
  | "lembrete_jogo"
  | "cobranca_mensalidade"
  | "convite_jogador"
  | "cancelamento"
  | "horario_alterado"
  | "lista_espera_promovida"
  | "aviso_generico";

export interface TemplateVariables {
  lembrete_jogo: {
    nome: string;
    equipe: string;
    data: string;
    hora: string;
    local: string;
    link: string;
  };
  cobranca_mensalidade: {
    nome: string;
    valor: string;
    mes: string;
    ano: string;
    equipe: string;
  };
  convite_jogador: {
    nome: string;
    equipe: string;
    link: string;
  };
  cancelamento: {
    nome: string;
    equipe: string;
    data: string;
  };
  horario_alterado: {
    nome: string;
    equipe: string;
    data: string;
    hora: string;
    local: string;
  };
  lista_espera_promovida: {
    nome: string;
    equipe: string;
    data: string;
    hora: string;
  };
  aviso_generico: {
    nome: string;
    mensagem: string;
  };
}

export interface WhatsAppProvider {
  send(to: string, templateName: string, variables: string[], language: string): Promise<NotificationResult>;
  sendText(to: string, text: string): Promise<NotificationResult>;
}
