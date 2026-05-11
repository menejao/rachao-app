"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

interface Props {
  paymentId: string;
  canEdit: boolean;
  onPaid?: (id: string) => void;
}

export function MarcarPagoButton({ paymentId, canEdit, onPaid }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!canEdit) return null;

  async function handle() {
    setLoading(true);
    try {
      await api.patch(`/api/pagamentos/${paymentId}/pagar`, {});
      toast("Pagamento marcado como pago.");
      onPaid?.(paymentId);
    } catch (e) {
      console.error("[marcar-pago]", e);
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
