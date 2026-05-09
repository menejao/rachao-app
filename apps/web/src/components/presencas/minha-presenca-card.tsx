"use client";

import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { RespostaPresenca } from "@rachao/types";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_CONFIG = {
  SIM: {
    label: "Confirmado",
    color: "text-emerald-300",
    bg: "bg-emerald-500/15 border-emerald-400/20",
  },
  NAO: {
    label: "Não vai",
    color: "text-rose-300",
    bg: "bg-rose-500/15 border-rose-400/20",
  },
  PENDENTE: {
    label: "Pendente",
    color: "text-yellow-300",
    bg: "bg-yellow-500/10 border-yellow-400/15",
  },
};

interface MinhaPresencaCardProps {
  presencaId: string;
  resposta: RespostaPresenca;
  readonly?: boolean;
}

export function MinhaPresencaCard({ presencaId, resposta: initialResposta, readonly }: MinhaPresencaCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [resposta, setResposta] = useState(initialResposta);
  const [busy, setBusy] = useState<RespostaPresenca | null>(null);

  async function confirm(next: RespostaPresenca) {
    if (busy || resposta === next || readonly) return;
    setBusy(next);
    const prev = resposta;
    setResposta(next);
    try {
      await api.patch(`/api/presencas/${presencaId}`, { resposta: next });
      router.refresh();
    } catch (e) {
      setResposta(prev);
      toast(e instanceof Error ? e.message : "Erro ao confirmar presença.", "error");
    } finally {
      setBusy(null);
    }
  }

  const status = STATUS_CONFIG[resposta];

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Minha presença</p>
          <span
            className={`rounded-full border px-3 py-0.5 text-[11px] font-medium ${status.bg} ${status.color}`}
          >
            {status.label}
          </span>
        </div>

        {readonly ? (
          <div
            className={`flex items-center justify-center gap-2 rounded-2xl border py-4 text-sm font-medium ${status.bg} ${status.color}`}
          >
            {resposta === "SIM" && <Check className="h-4 w-4" />}
            {resposta === "NAO" && <X className="h-4 w-4" />}
            {status.label}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => confirm("SIM")}
              disabled={!!busy}
              className={`flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold transition active:scale-95 disabled:opacity-60 ${
                resposta === "SIM"
                  ? "bg-emerald-500 text-[#07110a] shadow-lg shadow-emerald-900/30"
                  : "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
              }`}
            >
              {busy === "SIM" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Vou jogar
            </button>

            <button
              onClick={() => confirm("NAO")}
              disabled={!!busy}
              className={`flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold transition active:scale-95 disabled:opacity-60 ${
                resposta === "NAO"
                  ? "border border-rose-400/30 bg-rose-500/20 text-rose-300"
                  : "border border-white/10 bg-white/[0.04] text-stone-400 hover:bg-white/[0.08]"
              }`}
            >
              {busy === "NAO" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Não vou
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
