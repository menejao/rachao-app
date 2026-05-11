"use client";

import type { JogadorSummary, TurmaSummary, Posicao } from "@rachao/types";
import { Pencil, Search, Trash2, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { ResponsiveDataView } from "@/components/common/responsive-data-view";
import { SectionTitle } from "@/components/common/section-title";
import { PlayerCard } from "@/components/players/player-card";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";

const POSICOES: Posicao[] = ["GOLEIRO", "FIXO", "ALA", "PIVO", "CORINGA"];
const PAGE_SIZE = 20;

interface FormData {
  turmaId: string;
  nome: string;
  telefone: string;
  email: string;
  posicao: Posicao;
  nivel: number;
}

function emptyForm(defaultTurmaId: string): FormData {
  return { turmaId: defaultTurmaId, nome: "", telefone: "", email: "", posicao: "ALA", nivel: 3 };
}

export function JogadoresClient({
  initialPlayers,
  turmas,
  turmaNameMap,
}: {
  initialPlayers: JogadorSummary[];
  turmas: TurmaSummary[];
  turmaNameMap: Record<string, string>;
}) {
  const { toast } = useToast();
  const [players, setPlayers] = useState(initialPlayers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editPlayer, setEditPlayer] = useState<JogadorSummary | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm(turmas[0]?.id ?? ""));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // sync when server re-renders (router.refresh)
  useEffect(() => { setPlayers(initialPlayers); }, [initialPlayers]);

  const filtered = players.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.nome.toLowerCase().includes(q) || (p.telefone ?? "").includes(search);
  });
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  function openAdd() {
    setForm(emptyForm(turmas[0]?.id ?? ""));
    setFormError(null);
    setShowAdd(true);
  }

  function openEdit(player: JogadorSummary) {
    setForm({
      turmaId: player.turmaId,
      nome: player.nome,
      telefone: player.telefone ?? "",
      email: player.email ?? "",
      posicao: player.posicao,
      nivel: player.nivel,
    });
    setFormError(null);
    setEditPlayer(player);
  }

  async function handleCreate() {
    if (!form.nome.trim() || !form.telefone.trim()) {
      setFormError("Nome e telefone sao obrigatorios.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const created = await api.post<JogadorSummary>("/api/jogadores", {
        turmaId: form.turmaId,
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        email: form.email.trim() || undefined,
        posicao: form.posicao,
        nivel: Number(form.nivel),
      });
      setPlayers((prev) => [...prev, created].sort((a, b) => a.nome.localeCompare(b.nome)));
      toast("Jogador adicionado com sucesso!");
      setShowAdd(false);
    } catch (e) {
      console.error("[jogadores] create error:", e);
      setFormError(e instanceof Error ? e.message : "Erro ao criar jogador.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!editPlayer || !form.nome.trim()) {
      setFormError("Nome e obrigatorio.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const updated = await api.patch<JogadorSummary>(`/api/jogadores/${editPlayer.id}`, {
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        email: form.email.trim() || undefined,
        posicao: form.posicao,
        nivel: Number(form.nivel),
      });
      setPlayers((prev) =>
        prev.map((p) => (p.id === editPlayer.id ? { ...p, ...updated } : p))
      );
      toast("Jogador atualizado com sucesso!");
      setEditPlayer(null);
    } catch (e) {
      console.error("[jogadores] update error:", e);
      setFormError(e instanceof Error ? e.message : "Erro ao atualizar jogador.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDeleteId) return;
    setSaving(true);
    setFormError(null);
    try {
      await api.delete(`/api/jogadores/${confirmDeleteId}`);
      setPlayers((prev) => prev.filter((p) => p.id !== confirmDeleteId));
      toast("Jogador removido.");
      setConfirmDeleteId(null);
    } catch (e) {
      console.error("[jogadores] delete error:", e);
      setFormError(e instanceof Error ? e.message : "Erro ao excluir.");
    } finally {
      setSaving(false);
    }
  }

  const field = (key: keyof FormData, val: string | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <Search className="h-4 w-4 text-stone-500" />
              <input
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-stone-500"
                placeholder="Buscar por nome ou telefone"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button
              onClick={openAdd}
              className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-[#07110a]"
            >
              + Adicionar jogador
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <SectionTitle
          title="Lista de jogadores"
          description={`${filtered.length} ${filtered.length === 1 ? "jogador" : "jogadores"}`}
        />
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? "Nenhum resultado" : "Sem jogadores ainda"}
            description={
              search
                ? `Sem resultados para "${search}".`
                : "Cadastre o primeiro elenco para comecar confirmacoes e sorteios."
            }
          />
        ) : (
          <>
            <ResponsiveDataView
              desktop={
                <div className="overflow-x-auto">
                  <Table>
                    <thead>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Turma</TableHead>
                        <TableHead>Posicao</TableHead>
                        <TableHead className="text-right">Nivel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>{null}</TableHead>
                      </TableRow>
                    </thead>
                    <tbody>
                      {visible.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium text-white">{player.nome}</TableCell>
                          <TableCell>{turmaNameMap[player.turmaId] ?? "-"}</TableCell>
                          <TableCell>{player.posicao}</TableCell>
                          <TableCell className="text-right font-black text-white">{player.nivel}</TableCell>
                          <TableCell>{player.ativo ? "Ativo" : "Inativo"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEdit(player)}
                                className="rounded-xl p-1.5 text-stone-500 hover:bg-white/10 hover:text-white"
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => { setFormError(null); setConfirmDeleteId(player.id); }}
                                className="rounded-xl p-1.5 text-stone-500 hover:bg-rose-500/10 hover:text-rose-400"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                </div>
              }
              mobile={
                <div className="space-y-4">
                  {visible.map((player) => (
                    <div key={player.id}>
                      <PlayerCard
                        player={player}
                        turmaNome={turmaNameMap[player.turmaId] ?? "-"}
                        statusLabel={player.ativo ? "Ativo" : "Inativo"}
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => openEdit(player)}
                          className="flex-1 rounded-2xl border border-white/10 py-2 text-sm text-stone-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => { setFormError(null); setConfirmDeleteId(player.id); }}
                          className="flex-1 rounded-2xl border border-rose-400/20 py-2 text-sm text-rose-300"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              }
            />
            {hasMore && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="mt-4 w-full rounded-2xl border border-white/10 py-3 text-sm text-stone-400 transition hover:border-white/20 hover:text-white"
              >
                Ver mais ({filtered.length - visible.length} restantes)
              </button>
            )}
          </>
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={showAdd} onClose={() => setShowAdd(false)} title="Novo jogador">
        <PlayerForm
          form={form}
          turmas={turmas}
          showTurmaSelect={turmas.length > 1}
          error={formError}
          saving={saving}
          onField={field}
          onSubmit={handleCreate}
          onCancel={() => setShowAdd(false)}
          submitLabel="Adicionar"
        />
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editPlayer} onClose={() => setEditPlayer(null)} title="Editar jogador">
        <PlayerForm
          form={form}
          turmas={turmas}
          showTurmaSelect={false}
          error={formError}
          saving={saving}
          onField={field}
          onSubmit={handleUpdate}
          onCancel={() => setEditPlayer(null)}
          submitLabel="Salvar"
        />
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Confirmar exclusao"
      >
        <p className="text-sm text-stone-300">
          Esta acao remove o jogador permanentemente. Deseja continuar?
        </p>
        {formError && <p className="mt-2 text-sm text-rose-400">{formError}</p>}
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setConfirmDeleteId(null)}
            className="flex-1 rounded-2xl border border-white/10 py-3 text-sm text-stone-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="flex-1 rounded-2xl bg-rose-500 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </Dialog>
    </>
  );
}

function PlayerForm({
  form,
  turmas,
  showTurmaSelect,
  error,
  saving,
  onField,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  form: FormData;
  turmas: TurmaSummary[];
  showTurmaSelect: boolean;
  error: string | null;
  saving: boolean;
  onField: (key: keyof FormData, val: string | number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500";
  const labelClass = "mb-1.5 block text-xs text-stone-400";

  return (
    <div className="space-y-4">
      {showTurmaSelect && (
        <div>
          <label className={labelClass}>Turma</label>
          <select
            value={form.turmaId}
            onChange={(e) => onField("turmaId", e.target.value)}
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
        <label className={labelClass}>Nome *</label>
        <input
          value={form.nome}
          onChange={(e) => onField("nome", e.target.value)}
          placeholder="Ex: Joao"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Telefone * (com DDI e DDD, ex: 5511999...)</label>
        <input
          value={form.telefone}
          onChange={(e) => onField("telefone", e.target.value)}
          placeholder="5511999991234"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Email (opcional)</label>
        <input
          value={form.email}
          onChange={(e) => onField("email", e.target.value)}
          placeholder="joao@email.com"
          type="email"
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Posicao</label>
          <select
            value={form.posicao}
            onChange={(e) => onField("posicao", e.target.value)}
            className={inputClass}
          >
            {POSICOES.map((p) => (
              <option key={p} value={p} className="bg-[#0a1628]">
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Nivel (1-5)</label>
          <select
            value={form.nivel}
            onChange={(e) => onField("nivel", Number(e.target.value))}
            className={inputClass}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n} className="bg-[#0a1628]">
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-2xl border border-white/10 py-3 text-sm text-stone-300"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="flex-1 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-[#07110a] disabled:opacity-50"
        >
          {saving ? "Salvando..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
