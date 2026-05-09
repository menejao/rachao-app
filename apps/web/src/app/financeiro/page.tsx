import { CircleDollarSign, CreditCard, Eye, Receipt, Siren } from "lucide-react";
import { PaymentStatusBadge } from "@/components/common/payment-status-badge";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { StatCard } from "@/components/common/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { MarcarPagoButton } from "@/components/financeiro/marcar-pago-button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard-data";
import { auth } from "@/auth";
import { formatCurrency } from "@rachao/utils";

export default async function FinanceiroPage() {
  const [data, session] = await Promise.all([getDashboardData(), auth()]);
  const canEdit = session?.user.role === "ADMIN";
  const isPlayer = session?.user.role === "PLAYER";

  return (
    <AppShell data={data} currentPath="/financeiro">
      {isPlayer && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-sky-400/20 bg-sky-500/[0.06] px-4 py-3">
          <Eye className="h-4 w-4 shrink-0 text-sky-400" />
          <p className="text-sm text-sky-200">
            Você está visualizando o financeiro da equipe em modo leitura.
          </p>
        </div>
      )}
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
                  <div className="flex items-center gap-3">
                    {payment.status !== "PAGO" && payment.status !== "ISENTO" && (
                      <MarcarPagoButton paymentId={payment.id} canEdit={canEdit} />
                    )}
                    <div className="text-right">
                      <PaymentStatusBadge value={payment.status} />
                      <p className="mt-2 font-black text-white">{formatCurrency(payment.valor)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {data.financeiro.pagamentos.length === 0 && (
                <p className="text-sm text-stone-500">Nenhum pagamento registrado.</p>
              )}
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
                    <MarcarPagoButton paymentId={payment.id} canEdit={canEdit} />
                  </div>
                </div>
              ))}
              {data.financeiro.inadimplentes.length === 0 && (
                <p className="text-sm text-stone-500">Sem inadimplentes. Caixa limpo.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
