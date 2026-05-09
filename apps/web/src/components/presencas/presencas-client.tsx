"use client";

import type { PresencaSummary, RespostaPresenca } from "@rachao/types";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/common/section-title";

const RESP_CONFIG: Record<RespostaPresenca, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  SIM: { label: "Vai", icon: CheckCircle2, color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-400/20" },
  NAO: { label: "Não vai", icon: XCircle, color: "text-rose-300", bg: "bg-rose-500/10 border-rose-400/20" },
  PENDENTE: { label: "Pendente", icon: Clock3, color: "text-yellow-200", bg: "bg-yellow-400/10 border-yellow-400/20" },
};

function PresenceItem({
  item,
  onToggle,
  busy,
  readonly,
}: {
  item: PresencaSummary;
  onToggle: (id: string, next: RespostaPresenca) => void;
  busy: boolean;
  readonly?: boolean;
}) {
  const cfg = RESP_CONFIG[item.resposta];
  const Icon = cfg.icon;

  const next: RespostaPresenca =
    item.resposta === "SIM" ? "NAO" : item.resposta === "NAO" ? "PENDENTE" : "SIM";

  return (
    <div className={`flex items-center gap-3 rounded-[24px] border px-4 py-3 transition ${cfg.bg}`}>
      <Icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{item.jogadorNome}</p>
        <p className="text-xs text-stone-500">{item.turmaNome}</p>
      </div>
      {!readonly && (
        <button
          onClick={() => onToggle(item.id, next)}
          disabled={busy}
          className={`shrink-0 rounded-xl border px-2.5 py-1 text-xs font-medium transition hover:opacity-80 disabled:opacity-40 ${cfg.bg} ${cfg.color}`}
          title={`Mudar para ${RESP_CONFIG[next].label}`}
        >
          {cfg.label}
        </button>
      )}
      {readonly && (
        <span className={`shrink-0 rounded-xl border px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      )}
    </div>
  );
}

function PresenceColumn({
  title,
  count,
  items,
  icon: Icon,
  tone,
  onToggle,
  busyId,
  readonly,
}: {
  title: string;
  count: number;
  items: PresencaSummary[];
  icon: typeof CheckCircle2;
  tone: string;
  onToggle: (id: string, next: RespostaPresenca) => void;
  busyId: string | null;
  readonly?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="mb-4 flex items-center gap-2">
          <Icon className={`h-4 w-4 ${tone}`} />
          <SectionTitle title={title} description={`${count} jogadores`} />
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <PresenceItem
              key={item.id}
              item={item}
              onToggle={onToggle}
              busy={busyId === item.id}
              readonly={readonly}
            />
          ))}
          {items.length === 0 && (
            <p className="py-4 text-center text-sm text-stone-500">Nenhum jogador aqui.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function PresencasClient({ presencas, readonly }: { presencas: PresencaSummary[]; readonly?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState(presencas);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleToggle(id: string, next: RespostaPresenca) {
    if (readonly) return;
    setBusyId(id);
    const prev = items.find((i) => i.id === id)?.resposta;
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, resposta: next } : i)));
    try {
      await api.patch(`/api/presencas/${id}`, { resposta: next });
      toast(`Presença atualizada para ${RESP_CONFIG[next].label}.`);
      router.refresh();
    } catch (e) {
      setItems((cur) => cur.map((i) => (i.id === id ? { ...i, resposta: prev ?? i.resposta } : i)));
      toast(e instanceof Error ? e.message : "Erro ao atualizar presença.", "error");
    } finally {
      setBusyId(null);
    }
  }

  const confirmed = items.filter((i) => i.resposta === "SIM");
  const refused = items.filter((i) => i.resposta === "NAO");
  const pending = items.filter((i) => i.resposta === "PENDENTE");

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <PresenceColumn
        title="Confirmados"
        count={confirmed.length}
        items={confirmed}
        icon={CheckCircle2}
        tone="text-emerald-300"
        onToggle={handleToggle}
        busyId={busyId}
        readonly={readonly}
      />
      <PresenceColumn
        title="Recusados"
        count={refused.length}
        items={refused}
        icon={XCircle}
        tone="text-rose-300"
        onToggle={handleToggle}
        busyId={busyId}
        readonly={readonly}
      />
      <PresenceColumn
        title="Pendentes"
        count={pending.length}
        items={pending}
        icon={Clock3}
        tone="text-yellow-200"
        onToggle={handleToggle}
        busyId={busyId}
        readonly={readonly}
      />
    </div>
  );
}
