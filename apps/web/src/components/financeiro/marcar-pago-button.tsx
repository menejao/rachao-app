"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export function MarcarPagoButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await api.patch(`/api/pagamentos/${paymentId}/pagar`, {});
      toast("Pagamento marcado como pago.");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao marcar como pago.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400 active:scale-95 disabled:opacity-50"
    >
      {loading ? "Salvando..." : "Marcar pago"}
    </button>
  );
}
