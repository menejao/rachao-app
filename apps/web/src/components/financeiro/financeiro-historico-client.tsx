"use client";

import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import type { PagamentoSummary, JogadorSummary } from "@rachao/types";
import { PaymentStatusBadge } from "@/components/common/payment-status-badge";
import { SectionTitle } from "@/components/common/section-title";
import { MarcarPagoButton } from "@/components/financeiro/marcar-pago-button";
import { CobrarWhatsAppButton } from "@/components/financeiro/cobrar-whatsapp-button";
import { CobrarTodosButton } from "@/components/financeiro/cobrar-todos-button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@rachao/utils";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const STATUS_OPTIONS = ["TODOS", "PENDENTE", "ATRASADO", "PAGO", "ISENTO"] as const;

function mesLabel(m: number, a: number) {
  return `${MESES[(m - 1)] ?? m}/${a}`;
}

function exportCSV(pagamentos: PagamentoSummary[], filename: string) {
  const header = "Jogador,Referência,Valor,Status,Pago em";
  const rows = pagamentos.map((p) => [
    `"${p.jogadorNome}"`,
    mesLabel(p.referenciaMes, p.referenciaAno),
    p.valor.toFixed(2).replace(".", ","),
    p.status,
    p.pagoEm ? new Date(p.pagoEm).toLocaleDateString("pt-BR") : "",
  ].join(","));
  const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  pagamentos: PagamentoSummary[];
  jogadores: JogadorSummary[];
  turmaId: string;
  canEdit: boolean;
}

export function FinanceiroHistoricoClient({ pagamentos, jogadores, turmaId, canEdit }: Props) {
  const jogadorMap = useMemo(() => new Map(jogadores.map((j) => [j.id, j])), [jogadores]);

  const monthKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const p of pagamentos) {
      keys.add(`${p.referenciaAno}-${String(p.referenciaMes).padStart(2, "0")}`);
    }
    return ["TODOS", ...[...keys].sort((a, b) => b.localeCompare(a))];
  }, [pagamentos]);

  const [selectedMonth, setSelectedMonth] = useState(monthKeys[1] ?? "TODOS");
  const [selectedStatus, setSelectedStatus] = useState<typeof STATUS_OPTIONS[number]>("TODOS");

  const filtered = useMemo(() => {
    return pagamentos.filter((p) => {
      const key = `${p.referenciaAno}-${String(p.referenciaMes).padStart(2, "0")}`;
      if (selectedMonth !== "TODOS" && key !== selectedMonth) return false;
      if (selectedStatus !== "TODOS" && p.status !== selectedStatus) return false;
      return true;
    });
  }, [pagamentos, selectedMonth, selectedStatus]);

  const grouped = useMemo(() => {
    const map = new Map<string, PagamentoSummary[]>();
    for (const p of filtered) {
      const key = `${p.referenciaAno}-${String(p.referenciaMes).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const inadimplentesNoMes = useMemo(() => {
    if (selectedMonth === "TODOS") return [];
    return filtered.filter((p) => p.status === "PENDENTE" || p.status === "ATRASADO");
  }, [filtered, selectedMonth]);

  const [ano, mesStr] = selectedMonth !== "TODOS" ? selectedMonth.split("-") : [null, null];
  const mesFiltrado = mesStr ? parseInt(mesStr) : null;
  const anoFiltrado = ano ? parseInt(ano) : null;

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionTitle
            title="Histórico de pagamentos"
            description={`${filtered.length} registro${filtered.length !== 1 ? "s" : ""}`}
          />
          <button
            onClick={() => exportCSV(filtered, `financeiro-${selectedMonth}.csv`)}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-stone-400 transition hover:border-white/20 hover:text-white disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </button>
        </div>

        {/* Filtros */}
        <div className="mb-4 flex flex-wrap gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white outline-none"
          >
            {monthKeys.map((k) => (
              <option key={k} value={k} className="bg-[#0a1628]">
                {k === "TODOS" ? "Todos os meses" : (() => {
                  const [a, m] = k.split("-");
                  return mesLabel(parseInt(m ?? "1"), parseInt(a ?? "2025"));
                })()}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`rounded-xl px-3 py-1.5 text-xs transition ${
                  selectedStatus === s
                    ? "bg-white/15 text-white"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                {s === "TODOS" ? "Todos" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Cobrar todos (só no mês filtrado) */}
        {canEdit && mesFiltrado && anoFiltrado && inadimplentesNoMes.length > 0 && (
          <div className="mb-4">
            <CobrarTodosButton
              turmaId={turmaId}
              mes={mesFiltrado}
              ano={anoFiltrado}
              inadimplentesCount={inadimplentesNoMes.length}
            />
          </div>
        )}

        <div className="space-y-6">
          {grouped.map(([key, payments]) => {
            const [a, m] = key.split("-");
            const mes = parseInt(m ?? "1");
            const anoNum = parseInt(a ?? "2025");
            const pagos = payments.filter((p) => p.status === "PAGO").length;
            return (
              <div key={key}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">{mesLabel(mes, anoNum)}</span>
                  <span className="text-[11px] text-stone-500">{pagos}/{payments.length} pagos</span>
                </div>
                <div className="space-y-2">
                  {payments.map((payment) => {
                    const jogador = jogadorMap.get(payment.jogadorId);
                    return (
                      <div
                        key={payment.id}
                        className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{payment.jogadorNome}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <PaymentStatusBadge value={payment.status} />
                          <span className="w-16 text-right text-sm font-bold text-white">
                            {formatCurrency(payment.valor)}
                          </span>
                          {payment.status !== "PAGO" && payment.status !== "ISENTO" && (
                            <>
                              {jogador?.telefone && (
                                <CobrarWhatsAppButton
                                  telefone={jogador.telefone}
                                  nome={payment.jogadorNome}
                                  valor={payment.valor}
                                  mes={payment.referenciaMes}
                                  ano={payment.referenciaAno}
                                />
                              )}
                              <MarcarPagoButton paymentId={payment.id} canEdit={canEdit} />
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-4 text-center text-sm text-stone-500">Nenhum pagamento encontrado.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
