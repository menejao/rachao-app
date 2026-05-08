"use client";

import type { TurmaSummary } from "@rachao/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@rachao/utils";

const DIAS = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];

interface FormState {
  nome: string;
  local: string;
  diaSemana: number;
  horario: string;
  mensalidade: number;
}

function fromTurma(t: TurmaSummary): FormState {
  return {
    nome: t.nome,
    local: t.local ?? "",
    diaSemana: t.diaSemana,
    horario: t.horario,
    mensalidade: t.mensalidade,
  };
}

export function TurmaSettingsForm({ turma }: { turma: TurmaSummary }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(fromTurma(turma));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const field = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  async function handleSave() {
    if (!form.nome.trim()) {
      setError("Nome da turma e obrigatorio.");
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(form.horario)) {
      setError("Horario invalido. Use formato HH:MM.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/api/turmas/${turma.id}`, {
        nome: form.nome.trim(),
        local: form.local.trim() || null,
        diaSemana: Number(form.diaSemana),
        horario: form.horario,
        mensalidade: Number(form.mensalidade),
      });
      toast("Configuracoes salvas!");
      setDirty(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar configuracoes.");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setForm(fromTurma(turma));
    setDirty(false);
    setError(null);
  }

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 focus:border-emerald-500/40 transition";
  const labelClass = "mb-1.5 block text-xs text-stone-400";

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Nome da turma</label>
        <input
          value={form.nome}
          onChange={(e) => field("nome", e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Local</label>
        <input
          value={form.local}
          onChange={(e) => field("local", e.target.value)}
          placeholder="Ex: Arena Vila Olimpia"
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Dia da semana</label>
          <select
            value={form.diaSemana}
            onChange={(e) => field("diaSemana", Number(e.target.value))}
            className={inputClass}
          >
            {DIAS.map((d, i) => (
              <option key={i} value={i} className="bg-[#0a1628]">
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Horario padrao</label>
          <input
            type="time"
            value={form.horario}
            onChange={(e) => field("horario", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Mensalidade (R$)</label>
        <input
          type="number"
          min={0}
          step={0.01}
          value={form.mensalidade}
          onChange={(e) => field("mensalidade", Number(e.target.value))}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-stone-500">Atual: {formatCurrency(turma.mensalidade)}</p>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <div className="flex gap-3 pt-2">
        {dirty && (
          <button
            onClick={handleReset}
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-stone-300 transition hover:bg-white/[0.04]"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="flex-1 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400 disabled:opacity-40"
        >
          {saving ? "Salvando..." : dirty ? "Salvar alteracoes" : "Sem alteracoes"}
        </button>
      </div>
    </div>
  );
}
