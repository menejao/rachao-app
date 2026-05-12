"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Plug, RefreshCw, Wifi } from "lucide-react";
import type { TurmaSummary, WhatsappConnectionStatus } from "@rachao/types";
import { WhatsappStatusBadge } from "./whatsapp-status-badge";

interface Props {
  turma: TurmaSummary;
  botPhone: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-stone-300 transition hover:bg-white/[0.08] hover:text-white"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400">Copiado</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copiar
        </>
      )}
    </button>
  );
}

function StepNumber({ n, done }: { n: number; done?: boolean }) {
  return (
    <div
      className={[
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
        done
          ? "bg-emerald-500/20 text-emerald-400"
          : "bg-white/[0.08] text-stone-400",
      ].join(" ")}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : n}
    </div>
  );
}

function ConnectedState({ turma }: { turma: TurmaSummary }) {
  function relativeTime(iso: string | null | undefined): string {
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
            Conectado em{" "}
            {turma.whatsappConnectedAt
              ? new Date(turma.whatsappConnectedAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoRow label="Última atividade" value={relativeTime(turma.whatsappLastActivity)} />
        <InfoRow label="Provider" value={turma.whatsappProvider ?? "zapi"} />
      </div>

      <p className="text-[11px] text-stone-600">
        Para desconectar, acesse Configurações → WhatsApp e remova o Group ID da turma.
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-white/[0.03] px-3 py-2.5">
      <p className="text-[10px] text-stone-600">{label}</p>
      <p className="mt-0.5 text-xs font-medium text-stone-300">{value}</p>
    </div>
  );
}

function SetupSteps({
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
  const isAwaiting = status === "AGUARDANDO";

  return (
    <div className="space-y-4">
      {isAwaiting && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3">
          <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-amber-400" />
          <p className="text-sm text-amber-300">Aguardando o comando no grupo...</p>
        </div>
      )}

      {/* Step 1 */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
        <div className="flex items-center gap-2.5">
          <StepNumber n={1} />
          <p className="text-sm font-medium text-white">Adicione o bot ao grupo</p>
        </div>
        <p className="mt-2 text-xs text-stone-500">
          Abra seu grupo no WhatsApp e adicione o número abaixo como participante.
        </p>
        {botPhone !== "NAO_CONFIGURADO" ? (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
            <span className="font-mono text-sm text-white">{botPhone}</span>
            <CopyButton text={botPhone} />
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-rose-400">
            Configure a variável ZAPI_BOT_PHONE na Vercel.
          </p>
        )}
      </div>

      {/* Step 2 */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
        <div className="flex items-center gap-2.5">
          <StepNumber n={2} />
          <p className="text-sm font-medium text-white">Envie o código de ativação</p>
        </div>
        <p className="mt-2 text-xs text-stone-500">
          No grupo do WhatsApp, envie exatamente a mensagem abaixo.
        </p>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
          <span className="font-mono text-sm text-emerald-300">{command}</span>
          <CopyButton text={command} />
        </div>
        <p className="mt-2 text-[11px] text-stone-600">
          O código é único para esta turma. Cada turma tem seu próprio código.
        </p>
      </div>

      {/* Step 3 */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
        <div className="flex items-center gap-2.5">
          <StepNumber n={3} />
          <p className="text-sm font-medium text-white">Aguarde a confirmação do bot</p>
        </div>
        <p className="mt-2 text-xs text-stone-500">
          O bot vai responder automaticamente no grupo:
        </p>
        <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-3 py-2.5">
          <p className="text-xs text-emerald-300">
            ✅ Grupo conectado ao Rachão: {turma.nome}
          </p>
        </div>
      </div>

      {/* Step 4 */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
        <div className="flex items-center gap-2.5">
          <StepNumber n={4} />
          <p className="text-sm font-medium text-white">Teste o bot</p>
        </div>
        <p className="mt-2 text-xs text-stone-500">
          Envie uma mensagem no grupo para confirmar que está funcionando:
        </p>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
          <span className="font-mono text-sm text-white">SIM</span>
          <CopyButton text="SIM" />
        </div>
        <p className="mt-2 text-[11px] text-stone-600">
          Se houver um jogo aberto para confirmação, o bot vai registrar sua presença.
        </p>
      </div>
    </div>
  );
}

export function WhatsAppOnboardingCard({ turma, botPhone }: Props) {
  const status: WhatsappConnectionStatus = turma.whatsappStatus ?? "NAO_CONECTADO";
  const isConnected = status === "CONECTADO";

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
        <ConnectedState turma={turma} />
      ) : (
        <SetupSteps turma={turma} botPhone={botPhone} status={status} />
      )}
    </div>
  );
}
