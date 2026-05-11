"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export function EnviarLembreteButton({ jogoId }: { jogoId: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      const res = await api.post<{ sent: number; failed: number; total: number }>(
        "/api/notificacoes/lembrete",
        { jogoId }
      );
      toast(`Lembrete enviado: ${res.sent} de ${res.total} mensagens entregues.`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao enviar lembrete.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="flex items-center gap-2 rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:bg-sky-500/20 disabled:opacity-50 active:scale-95"
    >
      <Bell className="h-4 w-4" />
      {loading ? "Enviando..." : "Enviar lembrete"}
    </button>
  );
}
