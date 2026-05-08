"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

const DIAS = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];

interface TurmaForm {
  nome: string;
  local: string;
  diaSemana: number;
  horario: string;
  mensalidade: number;
}

export function NovaTurmaButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TurmaForm>({ nome: "", local: "", diaSemana: 3, horario: "20:00", mensalidade: 80 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field = <K extends keyof TurmaForm>(key: K, val: TurmaForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  function openModal() {
    setError(null);
    setForm({ nome: "", local: "", diaSemana: 3, horario: "20:00", mensalidade: 80 });
    setOpen(true);
  }

  async function handleCreate() {
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
      await api.post("/api/turmas", {
        nome: form.nome.trim(),
        local: form.local.trim() || undefined,
        diaSemana: Number(form.diaSemana),
        horario: form.horario,
        mensalidade: Number(form.mensalidade),
        organizadorId: process.env.NEXT_PUBLIC_ORGANIZADOR_ID ?? "demo",
      });
      toast(`Turma "${form.nome.trim()}" criada com sucesso!`);
      router.refresh();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar turma.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 focus:border-emerald-500/40 focus:ring-0 transition";
  const labelClass = "mb-1.5 block text-xs text-stone-400";

  return (
    <>
      <button
        onClick={openModal}
        className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400 active:scale-95"
      >
        Nova turma
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Nova turma">
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Nome *</label>
            <input
              value={form.nome}
              onChange={(e) => field("nome", e.target.value)}
              placeholder="Ex: Racha Quarta"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Local</label>
            <input
              value={form.local}
              onChange={(e) => field("local", e.target.value)}
              placeholder="Ex: Arena Vila"
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
              <label className={labelClass}>Horario</label>
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
              value={form.mensalidade}
              onChange={(e) => field("mensalidade", Number(e.target.value))}
              className={inputClass}
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 rounded-2xl border border-white/10 py-3 text-sm text-stone-300 transition hover:bg-white/[0.04]"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {saving ? "Criando..." : "Criar turma"}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
