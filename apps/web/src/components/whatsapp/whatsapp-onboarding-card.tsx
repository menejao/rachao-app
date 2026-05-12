"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import type { TurmaSummary, WhatsappConnectionStatus } from "@rachao/types";
import { WhatsappStatusBadge } from "./whatsapp-status-badge";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try { await navigator.clipboard.writeText(text); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-stone-300 transition hover:bg-white/[0.08] hover:text-white"
    >
      {copied ? (
        <><Check className="h-3 w-3 text-emerald-400" /><span className="text-emerald-400">Copiado</span></>
      ) : (
        <><Copy className="h-3 w-3" />Copiar</>
      )}
    </button>
  );
}

function StepRow({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="mb-2 flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[11px] font-bold text-stone-400">
          {n}
        </span>
        <p className="text-sm font-medium text-white">{title}</p>
      </div>
      {children}
    </div>
  );
}

function ConnectedView({
  turma,
  onAction,
  loading,
}: {
  turma: TurmaSummary;
  onAction: (a: "desconectar" | "novo-codigo") => void;
  loading: string | null;
}) {
  function relTime(iso: string | null | undefined): string {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "agora";
    if (mins < 60) return `há ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `há ${hrs}h`;
    return `há ${Math.floor(hrs / 24)}d`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-4">
        <Wifi className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-emerald-300">
            {turma.whatsappGroupName ?? "Grupo conectado"}
          </p>
          <p className="mt-0.5 text-[11px] text-stone-500">
            Última atividade: {relTime(turma.whatsappLastActivity)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={() => onAction("novo-codigo")}
          disabled={!!loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 py-2.5 text-sm text-stone-300 transition hover:bg-white/[0.05] disabled:opacity-40"
        >
          {loading === "novo-codigo" ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Gerar novo código
        </button>
        <button
          onClick={() => onAction("desconectar")}
          disabled={!!loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/[0.05] py-2.5 text-sm text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-40"
        >
          <WifiOff className="h-3.5 w-3.5" />
          Desconectar grupo
        </button>
      </div>
    </div>
  );
}

function SetupView({
  turma,
  botPhone,
  status,
}: {
  turma: TurmaSummary;
  botPhone: string;
  status: WhatsappConnectionStatus;
}) {
  const activationCode = turma.whatsappActivationCode ?? "RACHAO-????";
  const command = `/ativar ${activationCode}`;

  return (
    <div className="space-y-3">
      {status === "AGUARDANDO" && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3">
          <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-amber-400" />
          <p className="text-sm text-amber-300">Aguardando o comando no grupo…</p>
        </div>
      )}

      <StepRow n={1} title="Adicione o bot ao grupo">
        <p className="mb-2.5 text-xs text-stone-500">
          Abra o grupo do seu rachão no WhatsApp e adicione o número abaixo como participante.
        </p>
        {botPhone !== "NAO_CONFIGURADO" ? (
          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
            <span className="font-mono text-sm text-white">{botPhone}</span>
            <CopyButton text={botPhone} />
          </div>
        ) : (
          <p className="text-[11px] text-rose-400">Configure ZAPI_BOT_PHONE nas variáveis de ambiente.</p>
        )}
      </StepRow>

      <StepRow n={2} title="Envie o código de ativação">
        <p className="mb-2.5 text-xs text-stone-500">
          Envie essa mensagem no grupo para conectar automaticamente esta turma.
        </p>
        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
          <span className="font-mono text-sm text-emerald-300">{command}</span>
          <CopyButton text={command} />
        </div>
        <p className="mt-1.5 text-[11px] text-stone-600">
          Cada turma tem seu próprio código. Este código é exclusivo desta turma.
        </p>
      </StepRow>

      <StepRow n={3} title="Aguarde a confirmação">
        <p className="mb-2.5 text-xs text-stone-500">O bot vai responder automaticamente:</p>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-3 py-2.5">
          <p className="text-xs text-emerald-300">
            ✅ Grupo conectado ao Rachão: {turma.nome}
          </p>
        </div>
      </StepRow>

      <StepRow n={4} title="Teste o bot">
        <p className="mb-2.5 text-xs text-stone-500">
          Se houver um jogo aberto para confirmação, o bot registrará sua presença.
        </p>
        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
          <span className="font-mono text-sm text-white">SIM</span>
          <CopyButton text="SIM" />
        </div>
      </StepRow>
    </div>
  );
}

export function WhatsAppOnboardingCard({
  turma: initialTurma,
  botPhone,
}: {
  turma: TurmaSummary;
  botPhone: string;
}) {
  const [turma, setTurma] = useState(initialTurma);
  const [loading, setLoading] = useState<string | null>(null);

  const status: WhatsappConnectionStatus = turma.whatsappStatus ?? "NAO_CONECTADO";
  const isConnected = status === "CONECTADO";

  async function handleAction(action: "desconectar" | "novo-codigo") {
    setLoading(action);
    try {
      const res = await fetch(`/api/turmas/${turma.id}/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as { ok: boolean; turma?: Partial<TurmaSummary> };
      if (data.turma) {
        setTurma((prev) => ({ ...prev, ...data.turma }));
      }
    } catch (e) {
      console.error("[whatsapp-action]", e);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-emerald-400" />
          <p className="text-sm font-semibold text-white">
            {isConnected ? "WhatsApp conectado" : "Conectar grupo do WhatsApp"}
          </p>
        </div>
        <WhatsappStatusBadge status={status} />
      </div>

      {isConnected ? (
        <ConnectedView turma={turma} onAction={handleAction} loading={loading} />
      ) : (
        <SetupView turma={turma} botPhone={botPhone} status={status} />
      )}
    </div>
  );
}
