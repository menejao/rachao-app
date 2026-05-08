"use client";

import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export function RefazerSorteioButton({ jogoId }: { jogoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!jogoId) {
      alert("Nenhum jogo disponivel para refazer sorteio.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/times/gerar", { jogoId });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao refazer sorteio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading || !jogoId}
      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-[#07110a] disabled:opacity-50"
    >
      <RefreshCcw className="h-4 w-4" />
      {loading ? "Sorteando..." : "Refazer sorteio"}
    </button>
  );
}
