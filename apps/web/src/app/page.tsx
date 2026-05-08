import { AlertTriangle, CircleDollarSign, Clock3, Goal, Trophy, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard-data";
import {
  getHomeStats,
  getLatestResponses,
  getOrganizerAlerts,
  getQuickRanking,
  getWeeklyTimeline,
} from "@/lib/dashboard-view";
import { formatCurrency } from "@rachao/utils";

export default async function HomePage() {
  const data = await getDashboardData();
  const stats = getHomeStats(data);
  const timeline = getWeeklyTimeline(data);
  const latestResponses = getLatestResponses(data);
  const ranking = getQuickRanking(data);
  const alerts = getOrganizerAlerts(data);

  return (
    <AppShell data={data} currentPath="/">
      <PageHeader
        eyebrow="Painel do organizador"
        title="Semana da pelada em uma tela"
        description="Proximo jogo, caixa, confirmacoes e ranking rapido em um fluxo leve para usar no celular e no desktop."
        actions={
          <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-[#07110a]">
            Disparar confirmacao
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard title="Proximo jogo" value={stats.nextGameLabel} helper="Agenda principal da turma" icon={Clock3} />
        <StatCard title="Confirmados" value={String(stats.confirmed)} helper="Base para fechar lista" icon={Users} accent="emerald" />
        <StatCard title="Pendentes" value={String(stats.pending)} helper="Cobrar antes do sorteio" icon={AlertTriangle} accent="yellow" />
        <StatCard title="Inadimplentes" value={String(stats.debtors)} helper="Risco para o caixa do mes" icon={CircleDollarSign} accent="red" />
        <StatCard title="Saldo da turma" value={formatCurrency(stats.balance)} helper="Leitura rapida do caixa" icon={CircleDollarSign} accent="blue" />
        <StatCard title="Artilheiro do mes" value={stats.topScorer} helper="Destaque da resenha" icon={Trophy} accent="yellow" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="pt-5">
            <SectionTitle title="Linha do tempo da semana" description="Tudo que precisa acontecer ate o jogo." />
            <div className="space-y-4">
              {timeline.map((item) => (
                <div key={item.title} className="flex gap-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.9)]" />
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-stone-400">{item.description}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-300">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <SectionTitle title="Alertas do organizador" description="Coisas que pedem acao agora." />
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-sm text-stone-400">
                  Sem alertas criticos. Fluxo limpo.
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert} className="rounded-[24px] border border-rose-400/12 bg-rose-500/[0.06] p-4 text-sm text-rose-100">
                    {alert}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardContent className="pt-5">
            <SectionTitle title="Ultimas respostas do WhatsApp" description="Leitura rapida de quem respondeu." />
            <div className="space-y-3">
              {latestResponses.map((item) => (
                <div key={item.id} className="rounded-[24px] bg-white/[0.03] p-4">
                  <p className="font-medium text-white">{item.jogadorNome}</p>
                  <p className="mt-1 text-sm text-stone-500">{item.turmaNome}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-300">{item.resposta}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardContent className="pt-5">
            <SectionTitle title="Ranking rapido" description="Quem decide e quem sempre cola." />
            <div className="space-y-3">
              {ranking.map((item, index) => (
                <div key={item.jogadorId} className="flex items-center justify-between rounded-[24px] bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-400/12 font-black text-yellow-200">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.jogadorNome}</p>
                      <p className="text-sm text-stone-500">{item.turmaNome}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">{item.total}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">gols</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardContent className="pt-5">
            <SectionTitle title="Destaques da semana" description="Resumo de caixa, elenco e jogo." />
            <div className="space-y-3">
              <div className="rounded-[24px] bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Goal className="h-4 w-4" />
                  Artilheiro em alta
                </div>
                <p className="mt-2 text-lg font-bold text-white">{stats.topScorer}</p>
              </div>
              <div className="rounded-[24px] bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-sky-300">
                  <Users className="h-4 w-4" />
                  Confirmacao do jogo
                </div>
                <p className="mt-2 text-lg font-bold text-white">{stats.confirmed} confirmados</p>
              </div>
              <div className="rounded-[24px] bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-yellow-200">
                  <CircleDollarSign className="h-4 w-4" />
                  Saldo atual
                </div>
                <p className="mt-2 text-lg font-bold text-white">{formatCurrency(stats.balance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
