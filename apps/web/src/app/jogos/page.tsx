import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { AppShell } from "@/components/layout/app-shell";
import { MatchCard } from "@/components/matches/match-card";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard-data";
import { splitMatches } from "@/lib/dashboard-view";
import { formatDateTime } from "@/lib/format";

export default async function JogosPage() {
  const data = await getDashboardData();
  const { upcoming, previous } = splitMatches(data);

  return (
    <AppShell data={data} currentPath="/jogos">
      <PageHeader
        eyebrow="Agenda"
        title="Jogos"
        description="Proximos rachoes, historico recente e status de cada lista."
        actions={<button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-[#07110a]">Novo jogo</button>}
      />

      <div className="space-y-8">
        <section>
          <SectionTitle title="Proximos jogos" description="Confirmacao aberta, lista fechada e sorteio." />
          {upcoming.length === 0 ? (
            <EmptyState icon={CalendarDays} title="Sem jogos futuros" description="Crie o proximo jogo para abrir confirmacao e organizar a rodada." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {upcoming.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionTitle title="Jogos anteriores" description="Historico simples para consulta do organizador." />
          <div className="grid gap-4 lg:grid-cols-2">
            {previous.map((match) => (
              <Card key={match.id}>
                <CardContent className="pt-5">
                  <p className="font-semibold text-white">{match.turmaNome}</p>
                  <p className="mt-1 text-sm text-stone-400">{formatDateTime(match.dataJogo)}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-stone-500">{match.status.replaceAll("_", " ")}</span>
                    <span className="font-semibold text-white">{match.confirmados} confirmados</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {previous.length === 0 ? (
              <Card>
                <CardContent className="pt-5 text-sm text-stone-400">Nenhum jogo finalizado ainda.</CardContent>
              </Card>
            ) : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
