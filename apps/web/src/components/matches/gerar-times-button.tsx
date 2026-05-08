"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export function GerarTimesButton({ jogoId }: { jogoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await api.post("/api/times/gerar", { jogoId });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao gerar times");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#07110a] disabled:opacity-50"
    >
      {loading ? "Gerando..." : "Gerar times"}
    </button>
  );
}
