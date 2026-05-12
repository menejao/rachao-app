import type { WhatsappConnectionStatus } from "@rachao/types";

const CONFIG: Record<
  WhatsappConnectionStatus,
  { label: string; className: string; dot: string }
> = {
  NAO_CONECTADO: {
    label: "Não conectado",
    className: "bg-stone-500/15 text-stone-400",
    dot: "bg-stone-500",
  },
  AGUARDANDO: {
    label: "Aguardando ativação",
    className: "bg-amber-500/15 text-amber-400",
    dot: "bg-amber-400 animate-pulse",
  },
  CONECTADO: {
    label: "Conectado",
    className: "bg-emerald-500/15 text-emerald-400",
    dot: "bg-emerald-400",
  },
  ERRO: {
    label: "Erro de conexão",
    className: "bg-rose-500/15 text-rose-400",
    dot: "bg-rose-400",
  },
};

export function WhatsappStatusBadge({ status }: { status: WhatsappConnectionStatus }) {
  const cfg = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${cfg.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
