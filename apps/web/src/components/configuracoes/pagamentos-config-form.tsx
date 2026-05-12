"use client";

import type { TurmaSummary } from "@rachao/types";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@rachao/utils";

interface FormState {
  mensalidade: number;
  cobrancaDiaVencimento: number;
  pixKey: string;
  mensagemCobranca: string;
}

function fromTurma(t: TurmaSummary): FormState {
  return {
    mensalidade: t.mensalidade,
    cobrancaDiaVencimento: t.cobrancaDiaVencimento ?? 10,
    pixKey: t.pixKey ?? "",
    mensagemCobranca: t.mensagemCobranca ?? "",
  };
}

export function PagamentosConfigForm({ turma }: { turma: TurmaSummary }) {
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
    if (form.mensalidade < 0) { setError("Mensalidade não pode ser negativa."); return; }
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/api/turmas/${turma.id}`, {
        mensalidade: form.mensalidade,
        cobrancaDiaVencimento: form.cobrancaDiaVencimento,
        pixKey: form.pixKey.trim() || null,
        mensagemCobranca: form.mensagemCobranca.trim() || null,
      });
      toast("Configurações de pagamento salvas!");
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 focus:border-emerald-500/40 transition";
  const labelClass = "mb-1.5 block text-xs text-stone-400";

  return (
    <div className="space-y-4">
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
        <p className="mt-1 text-[11px] text-stone-600">
          Valor atual: {formatCurrency(turma.mensalidade)}
        </p>
      </div>

      <div>
        <label className={labelClass}>Dia de vencimento</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={28}
            value={form.cobrancaDiaVencimento}
            onChange={(e) =>
              field("cobrancaDiaVencimento", Math.min(28, Math.max(1, Number(e.target.value))))
            }
            className="w-24 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm text-white outline-none focus:border-emerald-500/40 transition"
          />
          <p className="text-sm text-stone-500">
            Mensalidade vence todo dia <span className="text-white">{form.cobrancaDiaVencimento}</span> do mês.
          </p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Chave Pix (opcional)</label>
        <input
          value={form.pixKey}
          onChange={(e) => field("pixKey", e.target.value)}
          className={inputClass}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
        />
        <p className="mt-1 text-[11px] text-stone-600">
          Incluída automaticamente nas mensagens de cobrança.
        </p>
      </div>

      <div>
        <label className={labelClass}>Mensagem de cobrança (opcional)</label>
        <textarea
          value={form.mensagemCobranca}
          onChange={(e) => field("mensagemCobranca", e.target.value)}
          rows={3}
          className={inputClass + " resize-none"}
          placeholder={`Ex: Olá {nome}! Sua mensalidade de ${formatCurrency(form.mensalidade)} vence dia ${form.cobrancaDiaVencimento}. Pix: {chave}`}
        />
        <p className="mt-1 text-[11px] text-stone-600">
          Use {"{nome}"} para o nome do jogador e {"{chave}"} para a chave Pix.
        </p>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <div className="flex gap-3 pt-2">
        {dirty && (
          <button
            onClick={() => { setForm(fromTurma(turma)); setDirty(false); setError(null); }}
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
          {saving ? "Salvando..." : dirty ? "Salvar configurações" : "Sem alterações"}
        </button>
      </div>
    </div>
  );
}
