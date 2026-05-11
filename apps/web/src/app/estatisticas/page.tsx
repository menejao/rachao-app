export const dynamic = 'force-dynamic';

import { BarChart3, Goal, Medal, Star } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { StatCard } from "@/components/common/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard-data";
import { getRecentGoals, getTopPresence, getTopScorers } from "@/lib/dashboard-view";

export default async function EstatisticasPage() {
  const data = await getDashboardData();
  const scorers = getTopScorers(data);
  const presence = getTopPresence(data);
  const recentGoals = getRecentGoals(data);

  return (
    <AppShell data={data} currentPath="/estatisticas">
      <PageHeader
        eyebrow="Performance"
        title="Estatisticas"
        description="Ranking, gols, presenca e espaco visual preparado para assistencias e filtros de temporada."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Gols" value={String(data.estatisticas.gols.length)} helper="Eventos registrados" icon={Goal} accent="yellow" />
        <StatCard title="Artilheiros" value={String(scorers.length)} helper="Jogadores com gol" icon={Medal} accent="emerald" />
        <StatCard title="Presenca lider" value={String(presence[0]?.total ?? 0)} helper="Maior numero de SIM" icon={BarChart3} accent="blue" />
        <StatCard title="Assistencias" value="Preparado" helper="Visual pronto para proxima fase" icon={Star} accent="yellow" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="pt-5">
            <SectionTitle title="Ranking de gols" description="Top da artilharia por turma." />
            <div className="space-y-3">
              {scorers.map((item, index) => (
                <div key={item.jogadorId} className="flex items-center justify-between rounded-[24px] bg-white/[0.03] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-400/12 font-black text-yellow-200">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.jogadorNome}</p>
                      <p className="text-sm text-stone-500">{item.turmaNome}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white">{item.total}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <SectionTitle title="Ranking de presenca" description="Quem mais confirma presença." />
            <div className="space-y-3">
              {presence.map((item, index) => (
                <div key={item.jogadorId} className="flex items-center justify-between rounded-[24px] bg-white/[0.03] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/12 font-black text-emerald-300">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.jogadorNome}</p>
                      <p className="text-sm text-stone-500">{item.turmaNome}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white">{item.total}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-5">
          <SectionTitle title="Timeline de gols" description="Ultimos registros de jogo." action={<button className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-stone-300">Mes atual</button>} />
          <div className="grid gap-4 lg:grid-cols-3">
            {recentGoals.map((item) => (
              <div key={`${item.title}-${item.subtitle}`} className="rounded-[24px] bg-white/[0.03] p-4">
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-stone-500">{item.subtitle}</p>
              </div>
            ))}
            <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.02] p-4">
              <p className="font-semibold text-white">Assistencias</p>
              <p className="mt-1 text-sm text-stone-500">Espaco visual ja preparado para proxima entrega.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
