import { CircleDollarSign, CreditCard, Receipt, Siren } from "lucide-react";
import { PaymentStatusBadge } from "@/components/common/payment-status-badge";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { StatCard } from "@/components/common/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatCurrency } from "@rachao/utils";

export default async function FinanceiroPage() {
  const data = await getDashboardData();

  return (
    <AppShell data={data} currentPath="/financeiro">
      <PageHeader
        eyebrow="Caixa"
        title="Financeiro"
        description="Pensado para uso rapido antes do jogo, com foco em saldo, pendencia e cobranca."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Saldo" value={formatCurrency(data.financeiro.saldoMensal)} helper="Panorama do caixa" icon={CircleDollarSign} accent="emerald" />
        <StatCard title="Entradas" value={formatCurrency(data.financeiro.recebidosMes)} helper="Recebidos no mes" icon={CreditCard} accent="blue" />
        <StatCard title="Saidas" value={formatCurrency(Math.max(0, data.financeiro.recebidosMes - data.financeiro.saldoMensal))} helper="Estimativa visual" icon={Receipt} accent="yellow" />
        <StatCard title="Inadimplentes" value={String(data.financeiro.inadimplentes.length)} helper="Precisam de follow-up" icon={Siren} accent="red" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardContent className="pt-5">
            <SectionTitle title="Pagamentos do mes" description="Leitura simples de quem pagou, atrasou ou segue pendente." />
            <div className="space-y-3">
              {data.financeiro.pagamentos.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-4 rounded-[24px] bg-white/[0.03] px-4 py-4">
                  <div>
                    <p className="font-medium text-white">{payment.jogadorNome}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      Ref. {payment.referenciaMes}/{payment.referenciaAno}
                    </p>
                  </div>
                  <div className="text-right">
                    <PaymentStatusBadge value={payment.status} />
                    <p className="mt-2 font-black text-white">{formatCurrency(payment.valor)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <SectionTitle title="Lista de cobrancas" description="Uso facil no celular na correria da quadra." />
            <div className="space-y-3">
              {data.financeiro.inadimplentes.map((payment) => (
                <div key={payment.id} className="rounded-[24px] border border-rose-400/12 bg-rose-500/[0.05] px-4 py-4">
                  <p className="font-medium text-white">{payment.jogadorNome}</p>
                  <p className="mt-1 text-sm text-stone-400">
                    Ref. {payment.referenciaMes}/{payment.referenciaAno}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <PaymentStatusBadge value={payment.status} />
                    <button className="rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-[#07110a]">
                      Cobrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
