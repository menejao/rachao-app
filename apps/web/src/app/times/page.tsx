import { Target } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { AppShell } from "@/components/layout/app-shell";
import { TeamCard } from "@/components/teams/team-card";
import { RefazerSorteioButton } from "@/components/times/refazer-sorteio-button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard-data";
import { getDifferenceBetweenTeams, getTeamColumns } from "@/lib/dashboard-view";

export default async function TimesPage() {
  const data = await getDashboardData();
  const teams = getTeamColumns(data);
  const difference = getDifferenceBetweenTeams(data.timesGerados);

  const jogoId =
    data.timesGerados[0]?.jogoId ??
    data.jogos.find((j) => j.status !== "FINALIZADO")?.id ??
    "";

  return (
    <AppShell data={data} currentPath="/times">
      <PageHeader
        eyebrow="Sorteio"
        title="Times gerados"
        description="Cards grandes para leitura rapida no vestiario, com media tecnica e composicao."
        actions={<RefazerSorteioButton jogoId={jogoId} />}
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-2 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <SectionTitle title="Equilibrio entre times" description="Quanto menor a diferenca, mais justo o sorteio." />
          <div className="rounded-2xl bg-white/[0.04] px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Diferenca de media</p>
            <p className="mt-1 text-2xl font-black text-white">{difference.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {teams.length === 0 ? (
        <EmptyState icon={Target} title="Sem times gerados" description="Feche lista e gere sorteio para ver os cards de cada equipe." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={{ ...team, nome: team.label }} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
