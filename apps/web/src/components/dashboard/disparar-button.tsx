"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Dialog } from "@/components/ui/dialog";

interface JogoInfo {
  turmaId: string;
  dataJogo: string;
  turmaNome: string;
}

export function DisbararButton({ jogoInfo }: { jogoInfo: JogoInfo | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!jogoInfo) {
      alert("Nenhum jogo disponivel. Crie um jogo primeiro em Jogos.");
      return;
    }
    setError(null);
    setOpen(true);
  }

  async function handleConfirm() {
    if (!jogoInfo) return;
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/presencas/disparar", {
        turmaId: jogoInfo.turmaId,
        dataJogo: jogoInfo.dataJogo,
      });
      router.refresh();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao disparar confirmacao");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-[#07110a]"
      >
        Disparar confirmacao
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Disparar confirmacao">
        <p className="text-sm text-stone-300">
          Enviar pedido de confirmacao para todos os jogadores de{" "}
          <span className="font-semibold text-white">{jogoInfo?.turmaNome}</span>?
        </p>
        <p className="mt-1 text-xs text-stone-500">Jogo: {jogoInfo?.dataJogo}</p>
        {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 rounded-2xl border border-white/10 py-3 text-sm text-stone-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-[#07110a] disabled:opacity-50"
          >
            {loading ? "Disparando..." : "Confirmar"}
          </button>
        </div>
      </Dialog>
    </>
  );
}
