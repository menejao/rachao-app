"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

interface Prefs {
  whatsappEnabled: boolean;
  paymentReminderEnabled: boolean;
  gameReminderEnabled: boolean;
  presenceReminderEnabled: boolean;
}

export function NotificationPrefsForm({ initial }: { initial: Prefs }) {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [saving, setSaving] = useState<keyof Prefs | null>(null);

  async function toggle(key: keyof Prefs) {
    const next = { ...prefs, [key]: !prefs[key] };

    if (key !== "whatsappEnabled" && !next.whatsappEnabled) return;

    setPrefs(next);
    setSaving(key);
    try {
      await api.patch("/api/notificacoes/prefs", { [key]: next[key] });
    } catch {
      setPrefs(prefs);
      toast("Erro ao salvar preferências.");
    } finally {
      setSaving(null);
    }
  }

  const rows: { key: keyof Prefs; label: string; description: string; disabled?: boolean }[] = [
    {
      key: "whatsappEnabled",
      label: "Notificações via WhatsApp",
      description: "Receber mensagens do Rachão no WhatsApp.",
    },
    {
      key: "gameReminderEnabled",
      label: "Lembrete de jogo",
      description: "Aviso 24h antes do próximo jogo.",
      disabled: !prefs.whatsappEnabled,
    },
    {
      key: "presenceReminderEnabled",
      label: "Lembrete de confirmação pendente",
      description: "Aviso quando sua lista ainda está em aberto.",
      disabled: !prefs.whatsappEnabled,
    },
    {
      key: "paymentReminderEnabled",
      label: "Cobrança de mensalidade",
      description: "Aviso de pagamento pendente.",
      disabled: !prefs.whatsappEnabled,
    },
  ];

  return (
    <div className="mt-4 space-y-3">
      {rows.map(({ key, label, description, disabled }) => (
        <div
          key={key}
          className={[
            "flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition",
            disabled ? "border-white/5 opacity-40" : "border-white/8 bg-white/[0.02]",
          ].join(" ")}
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">{label}</p>
            <p className="text-[11px] text-stone-500">{description}</p>
          </div>
          <button
            onClick={() => void toggle(key)}
            disabled={!!disabled || saving === key}
            aria-label={prefs[key] ? "Desativar" : "Ativar"}
            className={[
              "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
              prefs[key] ? "bg-emerald-500" : "bg-white/10",
              disabled ? "cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                prefs[key] ? "translate-x-5" : "translate-x-0.5",
              ].join(" ")}
            />
          </button>
        </div>
      ))}
      <p className="text-[10px] text-stone-600">
        Alterações salvas imediatamente. O organizador pode continuar te contatar pelo WhatsApp diretamente.
      </p>
    </div>
  );
}
