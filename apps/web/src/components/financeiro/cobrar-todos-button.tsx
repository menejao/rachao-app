"use client";

import { Send, X } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

interface CobrarTodosButtonProps {
  turmaId: string;
  mes: number;
  ano: number;
  inadimplentesCount: number;
}

export function CobrarTodosButton({ turmaId, mes, ano, inadimplentesCount }: CobrarTodosButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function send() {
    setConfirming(false);
    setLoading(true);
    try {
      const res = await api.post<{ sent: number; failed: number; total: number }>(
        "/api/notificacoes/cobranca",
        { turmaId, mes, ano }
      );
      if (res.failed > 0) {
        toast(`${res.sent} enviadas, ${res.failed} falharam.`, "error");
      } else {
        toast(`${res.sent} cobranças enviadas com sucesso.`);
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao enviar cobranças.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-400">Enviar para {inadimplentesCount} jogadores?</span>
        <button
          onClick={send}
          className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-400"
        >
          Confirmar
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-xl border border-white/10 p-1.5 text-stone-400 transition hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      disabled={loading || inadimplentesCount === 0}
      className="flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-400/20 px-4 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50 active:scale-95"
    >
      <Send className="h-3.5 w-3.5" />
      {loading ? "Enviando..." : `Cobrar todos (${inadimplentesCount})`}
    </button>
  );
}
