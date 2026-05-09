"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

type JogoStatus = "RASCUNHO" | "CONFIRMACAO_ABERTA" | "FECHADO" | "TIMES_GERADOS" | "FINALIZADO";

export function JogoStatusButton({ jogoId, status }: { jogoId: string; status: JogoStatus }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const transitions: Partial<Record<JogoStatus, { label: string; nextStatus: string; style: string }>> = {
    RASCUNHO: {
      label: "Abrir confirmação",
      nextStatus: "CONFIRMACAO_ABERTA",
      style: "bg-emerald-500 text-[#07110a] hover:bg-emerald-400",
    },
    CONFIRMACAO_ABERTA: {
      label: "Fechar lista",
      nextStatus: "FECHADO",
      style: "bg-yellow-500 text-black hover:bg-yellow-400",
    },
    FECHADO: {
      label: "Reabrir lista",
      nextStatus: "CONFIRMACAO_ABERTA",
      style: "bg-white/10 text-white hover:bg-white/15",
    },
    TIMES_GERADOS: {
      label: "Finalizar jogo",
      nextStatus: "FINALIZADO",
      style: "bg-sky-500 text-white hover:bg-sky-400",
    },
  };

  const transition = transitions[status];
  if (!transition) return null;

  async function handle() {
    setLoading(true);
    try {
      await api.patch(`/api/jogos/${jogoId}`, { status: transition!.nextStatus });
      toast("Status atualizado.");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao atualizar status.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-95 disabled:opacity-50 ${transition.style}`}
    >
      {loading ? "Salvando..." : transition.label}
    </button>
  );
}
