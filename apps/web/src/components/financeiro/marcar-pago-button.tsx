"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export function MarcarPagoButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await api.patch(`/api/pagamentos/${paymentId}/pagar`, {});
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao marcar como pago");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-[#07110a] disabled:opacity-50"
    >
      {loading ? "..." : "Marcar pago"}
    </button>
  );
}
