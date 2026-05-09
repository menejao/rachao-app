"use client";

import { Check, Copy, Link2, Share2, X } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export function InviteButton() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const data = await api.post<{ token: string }>("/api/invites", { role: "PLAYER" });
      const url = `${window.location.origin}/convite/${data.token}`;
      setInviteUrl(url);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao gerar convite.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!inviteUrl) return;
    const text = encodeURIComponent(`Você foi convidado para o Rachão! Entre pelo link: ${inviteUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function reset() {
    setInviteUrl(null);
    setCopied(false);
  }

  if (inviteUrl) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2">
          <Link2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="flex-1 truncate text-xs text-emerald-300">{inviteUrl}</span>
        </div>
        <button
          onClick={copyLink}
          title="Copiar link"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-stone-300 transition hover:bg-white/10"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
        <button
          onClick={shareWhatsApp}
          title="Compartilhar via WhatsApp"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/15 text-emerald-300 transition hover:bg-emerald-500/25"
        >
          <Share2 className="h-4 w-4" />
        </button>
        <button
          onClick={reset}
          title="Fechar"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-stone-500 transition hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={generate}
      disabled={loading}
      className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.09] disabled:opacity-50"
    >
      <Link2 className="h-4 w-4" />
      {loading ? "Gerando..." : "Convidar jogador"}
    </button>
  );
}
