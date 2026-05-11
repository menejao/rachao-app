import { CircleDollarSign, CreditCard, Eye, Siren, TrendingUp } from "lucide-react";
import { auth } from "@/auth";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { FinanceiroHistoricoClient } from "@/components/financeiro/financeiro-historico-client";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatCurrency } from "@rachao/utils";

export default async function FinanceiroPage() {
  const [data, session] = await Promise.all([getDashboardData(), auth()]);
  const canEdit = session?.user.role === "ADMIN";
  const isPlayer = session?.user.role === "PLAYER";

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

      <div className="mt-6">
        <FinanceiroHistoricoClient
          pagamentos={data.financeiro.pagamentos}
          jogadores={data.jogadores}
          turmaId={data.turmas[0]?.id ?? ""}
          canEdit={canEdit}
        />
      </div>
    </AppShell>
  );
}
