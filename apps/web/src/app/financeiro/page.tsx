import { CircleDollarSign, CreditCard, Eye, Siren, TrendingUp } from "lucide-react";
import { auth } from "@/auth";
import { PaymentStatusBadge } from "@/components/common/payment-status-badge";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { StatCard } from "@/components/common/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { MarcarPagoButton } from "@/components/financeiro/marcar-pago-button";
import { CobrarWhatsAppButton } from "@/components/financeiro/cobrar-whatsapp-button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatCurrency } from "@rachao/utils";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function mesLabel(m: number, a: number) {
  return `${MESES[(m - 1)] ?? m}/${a}`;
}

export default async function FinanceiroPage() {
  const [data, session] = await Promise.all([getDashboardData(), auth()]);
  const canEdit = session?.user.role === "ADMIN";
  const isPlayer = session?.user.role === "PLAYER";

  // Join jogador phone for WhatsApp cobrar
  const jogadorMap = new Map(data.jogadores.map((j) => [j.id, j]));

  // Group all payments by mes/ano descending
  const grouped = new Map<string, typeof data.financeiro.pagamentos>();
  for (const p of data.financeiro.pagamentos) {
    const key = `${p.referenciaAno}-${String(p.referenciaMes).padStart(2, "0")}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  }
  const sortedGroups = [...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0]));

  // Progress bar: recebidos / (recebidos + pendentes)
  const totalMes = data.financeiro.recebidosMes + data.financeiro.pendentesMes;
  const pctRecebido = totalMes > 0 ? Math.round((data.financeiro.recebidosMes / totalMes) * 100) : 0;

  return (
    <AppShell data={data} currentPath="/financeiro">
      {isPlayer && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-sky-400/20 bg-sky-500/[0.06] px-4 py-3">
          <Eye className="h-4 w-4 shrink-0 text-sky-400" />
          <p className="text-sm text-sky-200">Você está visualizando o financeiro em modo leitura.</p>
        </div>
      )}

      <PageHeader
        eyebrow="Caixa"
        title="Financeiro"
        description="Saldo, inadimplência e cobrança rápida para o dia do rachão."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Saldo"
          value={formatCurrency(data.financeiro.saldoMensal)}
          helper="Recebido − pendente"
          icon={CircleDollarSign}
          accent="emerald"
        />
        <StatCard
          title="Recebido"
          value={formatCurrency(data.financeiro.recebidosMes)}
          helper="Pago este mês"
          icon={CreditCard}
          accent="blue"
        />
        <StatCard
          title="Pendente"
          value={formatCurrency(data.financeiro.pendentesMes)}
          helper="A receber"
          icon={TrendingUp}
          accent="yellow"
        />
        <StatCard
          title="Inadimplentes"
          value={String(data.financeiro.inadimplentes.length)}
          helper="Precisam de follow-up"
          icon={Siren}
          accent="red"
        />
      </div>

      {/* Progress bar do mês */}
      {totalMes > 0 && (
        <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
          <div className="mb-2 flex items-center justify-between text-[11px] text-stone-500">
            <span>Arrecadação do mês</span>
            <span className="font-semibold text-emerald-400">{pctRecebido}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pctRecebido}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-stone-600">
            <span>{formatCurrency(data.financeiro.recebidosMes)} recebido</span>
            <span>{formatCurrency(data.financeiro.pendentesMes)} pendente</span>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Pagamentos agrupados por mês */}
        <Card>
          <CardContent className="pt-5">
            <SectionTitle title="Histórico de pagamentos" description="Agrupado por referência." />
            <div className="mt-4 space-y-6">
              {sortedGroups.map(([key, payments]) => {
                const [ano, mesStr] = key.split("-");
                const mes = parseInt(mesStr ?? "1");
                const anoNum = parseInt(ano ?? "2025");
                const pagos = payments.filter((p) => p.status === "PAGO").length;
                return (
                  <div key={key}>
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">{mesLabel(mes, anoNum)}</span>
                      <span className="text-[11px] text-stone-500">{pagos}/{payments.length} pagos</span>
                    </div>
                    <div className="space-y-2">
                      {payments.map((payment) => (
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
                              <MarcarPagoButton paymentId={payment.id} canEdit={canEdit} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {data.financeiro.pagamentos.length === 0 && (
                <p className="py-4 text-center text-sm text-stone-500">Nenhum pagamento registrado.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de cobranças com WhatsApp */}
        <Card>
          <CardContent className="pt-5">
            <SectionTitle title="Cobranças pendentes" description="Toque para cobrar via WhatsApp." />
            <div className="mt-4 space-y-3">
              {data.financeiro.inadimplentes.map((payment) => {
                const jogador = jogadorMap.get(payment.jogadorId);
                return (
                  <div
                    key={payment.id}
                    className="rounded-2xl border border-rose-400/12 bg-rose-500/[0.05] px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-white">{payment.jogadorNome}</p>
                        <p className="mt-0.5 text-[11px] text-stone-500">
                          {mesLabel(payment.referenciaMes, payment.referenciaAno)}
                        </p>
                      </div>
                      <span className="text-sm font-black text-rose-300">
                        {formatCurrency(payment.valor)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <PaymentStatusBadge value={payment.status} />
                      <div className="flex items-center gap-2">
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
                      </div>
                    </div>
                  </div>
                );
              })}
              {data.financeiro.inadimplentes.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-2xl">✓</p>
                  <p className="mt-1 text-sm font-medium text-emerald-400">Caixa limpo!</p>
                  <p className="text-xs text-stone-500">Sem inadimplentes este mês.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
