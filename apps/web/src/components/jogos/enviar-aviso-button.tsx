"use client";

import { Megaphone } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function EnviarAvisoButton({ turmaId }: { turmaId: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!mensagem.trim()) return;
    setLoading(true);
    try {
      const res = await api.post<{ sent: number; failed: number; total: number }>(
        "/api/notificacoes/aviso",
        { turmaId, mensagem: mensagem.trim() }
      );
      toast(`Aviso enviado: ${res.sent} de ${res.total} mensagens entregues.`);
      setOpen(false);
      setMensagem("");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao enviar aviso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20 active:scale-95"
      >
        <Megaphone className="h-4 w-4" />
        Enviar aviso
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Enviar aviso para a turma">
        <div className="space-y-4">
          <p className="text-sm text-stone-400">
            A mensagem será enviada via WhatsApp para todos os jogadores ativos da turma.
          </p>
          <div>
            <label className="mb-1.5 block text-xs text-stone-400">Mensagem *</label>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={4}
              placeholder="Ex: Jogo de amanhã confirmado! Cheguem 10 min antes."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 focus:border-emerald-500/40 transition resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 rounded-2xl border border-white/10 py-3 text-sm text-stone-300 transition hover:bg-white/[0.04]"
            >
              Cancelar
            </button>
            <button
              onClick={handle}
              disabled={loading || !mensagem.trim()}
              className="flex-1 rounded-2xl bg-amber-500 py-3 text-sm font-semibold text-[#07110a] transition hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
