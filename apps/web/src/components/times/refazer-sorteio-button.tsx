"use client";

import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export function RefazerSorteioButton({ jogoId }: { jogoId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!jogoId) {
      toast("Nenhum jogo disponivel para refazer sorteio.", "error");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/times/gerar", { jogoId });
      toast("Sorteio refeito com sucesso!");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao refazer sorteio.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading || !jogoId}
      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400 active:scale-95 disabled:opacity-50"
    >
      <RefreshCcw className="h-4 w-4" />
      {loading ? "Sorteando..." : "Refazer sorteio"}
    </button>
  );
}
