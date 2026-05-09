"use client";

import type { TurmaSummary } from "@rachao/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

interface JogoForm {
  turmaId: string;
  dataJogo: string;
  limitJogadores: string;
  observacoes: string;
}

export function NovoJogoButton({ turmas }: { turmas: TurmaSummary[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<JogoForm>({
    turmaId: turmas[0]?.id ?? "",
    dataJogo: "",
    limitJogadores: "14",
    observacoes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field = <K extends keyof JogoForm>(key: K, val: JogoForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  function openModal() {
    setError(null);
    setForm({ turmaId: turmas[0]?.id ?? "", dataJogo: "", limitJogadores: "14", observacoes: "" });
    setOpen(true);
  }

  async function handleCreate() {
    if (!form.turmaId || !form.dataJogo) {
      setError("Turma e data do jogo são obrigatórios.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const limite = parseInt(form.limitJogadores);
      await api.post("/api/jogos", {
        turmaId: form.turmaId,
        dataJogo: form.dataJogo,
        limitJogadores: !isNaN(limite) && limite > 0 ? limite : null,
        observacoes: form.observacoes || undefined,
      });
      toast("Jogo criado com sucesso!");
      router.refresh();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar jogo.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 focus:border-emerald-500/40 transition";
  const labelClass = "mb-1.5 block text-xs text-stone-400";

  return (
    <>
      <button
        onClick={openModal}
        className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400 active:scale-95"
      >
        Novo jogo
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Novo jogo">
        <div className="space-y-4">
          {turmas.length > 1 && (
            <div>
              <label className={labelClass}>Turma</label>
              <select
                value={form.turmaId}
                onChange={(e) => field("turmaId", e.target.value)}
                className={inputClass}
              >
                {turmas.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#0a1628]">
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className={labelClass}>Data e hora do jogo *</label>
            <input
              type="datetime-local"
              value={form.dataJogo}
              onChange={(e) => field("dataJogo", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Limite de jogadores</label>
            <input
              type="number"
              min="1"
              max="50"
              value={form.limitJogadores}
              onChange={(e) => field("limitJogadores", e.target.value)}
              placeholder="14"
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-stone-600">
              Ao atingir, próximas confirmações entram na fila de espera automaticamente.
            </p>
          </div>
          <div>
            <label className={labelClass}>Observações (opcional)</label>
            <input
              value={form.observacoes}
              onChange={(e) => field("observacoes", e.target.value)}
              placeholder="Ex: Traga bib azul"
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
              {saving ? "Criando..." : "Criar jogo"}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
