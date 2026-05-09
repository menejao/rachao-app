import type { JogoStatus } from "@rachao/types";

const LIMITE_DEFAULT = 14;

interface JogoStatusBadgeProps {
  status: JogoStatus;
  confirmados?: number;
  limite?: number;
  naFila?: number;
  size?: "sm" | "md";
}

function resolveLabel(status: JogoStatus, confirmados: number, limite: number, naFila: number): string {
  if (status === "CONFIRMACAO_ABERTA") {
    if (confirmados >= limite) return naFila > 0 ? `Lotado (+${naFila})` : "Lotado";
    if (confirmados >= Math.floor(limite * 0.8)) return "Quase lotado";
    return "Lista aberta";
  }
  return LABEL[status];
}

function resolveClasses(status: JogoStatus, confirmados: number, limite: number): string {
  if (status === "CONFIRMACAO_ABERTA") {
    if (confirmados >= limite) return "bg-red-500/15 text-red-400 border-red-400/20";
    if (confirmados >= Math.floor(limite * 0.8)) return "bg-orange-500/15 text-orange-400 border-orange-400/20";
    return "bg-emerald-500/15 text-emerald-400 border-emerald-400/20";
  }
  return COLOR[status];
}

const LABEL: Record<JogoStatus, string> = {
  RASCUNHO: "Rascunho",
  CONFIRMACAO_ABERTA: "Lista aberta",
  FECHADO: "Lista fechada",
  TIMES_GERADOS: "Times sorteados",
  FINALIZADO: "Finalizado",
};

const COLOR: Record<JogoStatus, string> = {
  RASCUNHO: "bg-stone-500/15 text-stone-400 border-stone-400/20",
  CONFIRMACAO_ABERTA: "bg-emerald-500/15 text-emerald-400 border-emerald-400/20",
  FECHADO: "bg-yellow-500/15 text-yellow-400 border-yellow-400/20",
  TIMES_GERADOS: "bg-sky-500/15 text-sky-400 border-sky-400/20",
  FINALIZADO: "bg-stone-500/10 text-stone-500 border-stone-500/10",
};

const DOT: Record<JogoStatus, string> = {
  RASCUNHO: "bg-stone-400",
  CONFIRMACAO_ABERTA: "bg-emerald-400",
  FECHADO: "bg-yellow-400",
  TIMES_GERADOS: "bg-sky-400",
  FINALIZADO: "bg-stone-500",
};

export function JogoStatusBadge({ status, confirmados = 0, limite = LIMITE_DEFAULT, naFila = 0, size = "sm" }: JogoStatusBadgeProps) {
  const label = resolveLabel(status, confirmados, limite, naFila);
  const classes = resolveClasses(status, confirmados, limite);

  const dotColor =
    status === "CONFIRMACAO_ABERTA" && confirmados >= limite
      ? "bg-red-400"
      : status === "CONFIRMACAO_ABERTA" && confirmados >= Math.floor(limite * 0.8)
        ? "bg-orange-400 animate-pulse"
        : DOT[status];

  const textSize = size === "md" ? "text-xs" : "text-[11px]";
  const padding = size === "md" ? "px-3 py-1" : "px-2.5 py-0.5";
  const dotSize = size === "md" ? "h-1.5 w-1.5" : "h-1.5 w-1.5";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium ${textSize} ${padding} ${classes}`}
    >
      <span className={`rounded-full ${dotSize} ${dotColor}`} />
      {label}
    </span>
  );
}
