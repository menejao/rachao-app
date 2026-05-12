"use client";

import type { ReactNode } from "react";
import type { TurmaSummary } from "@rachao/types";
import { useState } from "react";
import { Bell, Clock, CreditCard, Lock, Trophy, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

function nextGameDate(diaSemana: number, horario: string): Date {
  const [hh = 20, mm = 0] = horario.split(":").map(Number);
  const now = new Date();
  const nowDay = now.getDay();
  let diff = diaSemana - nowDay;
  if (diff < 0) diff += 7;
  if (diff === 0) {
    const todayGame = new Date(now);
    todayGame.setHours(hh, mm, 0, 0);
    if (now >= todayGame) diff = 7;
  }
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(hh, mm, 0, 0);
  return next;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface AutoForm {
  autoConfirmacaoHoras: number;
  autoLembreteHoras: number;
  autoFechamentoHoras: number;
  autoTimesHoras: number;
  cobrancaDiaVencimento: number;
  cobrancaLembreteDiasAntes: number;
  cobrancaLembreteDia: boolean;
  cobrancaLembreteApos: number;
}

function fromTurma(t: TurmaSummary): AutoForm {
  return {
    autoConfirmacaoHoras: t.autoConfirmacaoHoras ?? 48,
    autoLembreteHoras: t.autoLembreteHoras ?? 24,
    autoFechamentoHoras: t.autoFechamentoHoras ?? 2,
    autoTimesHoras: t.autoTimesHoras ?? 1,
    cobrancaDiaVencimento: t.cobrancaDiaVencimento ?? 10,
    cobrancaLembreteDiasAntes: t.cobrancaLembreteDiasAntes ?? 3,
    cobrancaLembreteDia: t.cobrancaLembreteDia ?? true,
    cobrancaLembreteApos: t.cobrancaLembreteApos ?? 3,
  };
}

function AutoCard({
  icon,
  title,
  description,
  next,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  next: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04]">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="mt-0.5 text-xs text-stone-500">{description}</p>
            <p className="mt-1.5 text-[11px] text-emerald-400/80">{next}</p>
          </div>
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    </div>
  );
}

export function AutomacoesForm({ turma }: { turma: TurmaSummary }) {
  const { toast } = useToast();
  const [form, setForm] = useState<AutoForm>(fromTurma(turma));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const field = <K extends keyof AutoForm>(key: K, val: AutoForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  const nextGame = nextGameDate(turma.diaSemana, turma.horario);
  const confAt = new Date(nextGame.getTime() - form.autoConfirmacaoHoras * 3600_000);
  const remAt = new Date(nextGame.getTime() - form.autoLembreteHoras * 3600_000);
  const closeAt = new Date(nextGame.getTime() - form.autoFechamentoHoras * 3600_000);
  const teamsAt = new Date(nextGame.getTime() - form.autoTimesHoras * 3600_000);

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch(`/api/turmas/${turma.id}`, {
        autoConfirmacaoHoras: form.autoConfirmacaoHoras,
        autoLembreteHoras: form.autoLembreteHoras,
        autoFechamentoHoras: form.autoFechamentoHoras,
        autoTimesHoras: form.autoTimesHoras,
        cobrancaDiaVencimento: form.cobrancaDiaVencimento,
        cobrancaLembreteDiasAntes: form.cobrancaLembreteDiasAntes,
        cobrancaLembreteDia: form.cobrancaLembreteDia,
        cobrancaLembreteApos: form.cobrancaLembreteApos,
      });
      toast("Automações salvas!");
      setDirty(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const numInput = (
    val: number,
    min: number,
    max: number,
    onChange: (n: number) => void
  ) => (
    <input
      type="number"
      min={min}
      max={max}
      value={val}
      onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
      className="w-16 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1.5 text-center text-sm text-white outline-none focus:border-emerald-500/40 transition"
    />
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">
          Antes do jogo
        </p>
        <div className="space-y-3">
          <AutoCard
            icon={<Bell className="h-4 w-4 text-emerald-400" />}
            title="Confirmação automática"
            description="Mensagem enviada ao grupo pedindo presença de todos os jogadores."
            next={`Próxima: ${fmtDate(confAt)}`}
          >
            <div className="flex items-center gap-2">
              {numInput(form.autoConfirmacaoHoras, 1, 720, (v) => field("autoConfirmacaoHoras", v))}
              <span className="text-xs text-stone-500">h antes</span>
            </div>
          </AutoCard>

          <AutoCard
            icon={<Clock className="h-4 w-4 text-amber-400" />}
            title="Lembrete de pendentes"
            description="Lembrete enviado para quem ainda não respondeu."
            next={`Próximo: ${fmtDate(remAt)}`}
          >
            <div className="flex items-center gap-2">
              {numInput(form.autoLembreteHoras, 1, 720, (v) => field("autoLembreteHoras", v))}
              <span className="text-xs text-stone-500">h antes</span>
            </div>
          </AutoCard>

          <AutoCard
            icon={<Lock className="h-4 w-4 text-rose-400" />}
            title="Fechamento da lista"
            description="Lista encerrada — novas respostas ficam na fila de espera."
            next={`Próximo: ${fmtDate(closeAt)}`}
          >
            <div className="flex items-center gap-2">
              {numInput(form.autoFechamentoHoras, 1, 48, (v) => field("autoFechamentoHoras", v))}
              <span className="text-xs text-stone-500">h antes</span>
            </div>
          </AutoCard>

          <AutoCard
            icon={<Trophy className="h-4 w-4 text-blue-400" />}
            title="Geração de times"
            description="Times balanceados gerados automaticamente antes do jogo."
            next={`Próxima: ${fmtDate(teamsAt)}`}
          >
            <div className="flex items-center gap-2">
              {numInput(form.autoTimesHoras, 1, 24, (v) => field("autoTimesHoras", v))}
              <span className="text-xs text-stone-500">h antes</span>
            </div>
          </AutoCard>
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500">
          Cobrança de mensalidade
        </p>
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04]">
                <CreditCard className="h-4 w-4 text-stone-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Vencimento</p>
                <p className="mt-0.5 text-xs text-stone-500">Dia do mês em que a mensalidade vence.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Dia</span>
                {numInput(form.cobrancaDiaVencimento, 1, 28, (v) => field("cobrancaDiaVencimento", v))}
              </div>
            </div>
          </div>

          <AutoCard
            icon={<Users className="h-4 w-4 text-stone-400" />}
            title="Lembrete antes do vencimento"
            description="Aviso enviado alguns dias antes para membros com mensalidade pendente."
            next={`Enviado ${form.cobrancaLembreteDiasAntes} dias antes do dia ${form.cobrancaDiaVencimento}`}
          >
            <div className="flex items-center gap-2">
              {numInput(form.cobrancaLembreteDiasAntes, 0, 30, (v) => field("cobrancaLembreteDiasAntes", v))}
              <span className="text-xs text-stone-500">dias</span>
            </div>
          </AutoCard>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04]">
                  <Bell className="h-4 w-4 text-stone-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Lembrete no dia do vencimento</p>
                  <p className="mt-0.5 text-xs text-stone-500">Notificação enviada no dia {form.cobrancaDiaVencimento} para membros em atraso.</p>
                </div>
              </div>
              <button
                onClick={() => field("cobrancaLembreteDia", !form.cobrancaLembreteDia)}
                className={[
                  "relative h-5 w-9 shrink-0 rounded-full transition",
                  form.cobrancaLembreteDia ? "bg-emerald-500" : "bg-white/10",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
                    form.cobrancaLembreteDia ? "left-4" : "left-0.5",
                  ].join(" ")}
                />
              </button>
            </div>
          </div>

          <AutoCard
            icon={<Bell className="h-4 w-4 text-rose-400" />}
            title="Lembrete após vencimento"
            description="Cobrança enviada para membros em atraso após a data de vencimento."
            next={`Enviado ${form.cobrancaLembreteApos} dias após o dia ${form.cobrancaDiaVencimento}`}
          >
            <div className="flex items-center gap-2">
              {numInput(form.cobrancaLembreteApos, 0, 30, (v) => field("cobrancaLembreteApos", v))}
              <span className="text-xs text-stone-500">dias</span>
            </div>
          </AutoCard>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !dirty}
        className="w-full rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400 disabled:opacity-40"
      >
        {saving ? "Salvando..." : dirty ? "Salvar automações" : "Sem alterações"}
      </button>
    </div>
  );
}
