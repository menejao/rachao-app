export const dynamic = 'force-dynamic';

import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { AppShell } from "@/components/layout/app-shell";
import { MatchCard } from "@/components/matches/match-card";
import { NovoJogoButton } from "@/components/jogos/novo-jogo-button";
import { JogoStatusBadge } from "@/components/ui/jogo-status-badge";
import { getDashboardData } from "@/lib/dashboard-data";
import { splitMatches } from "@/lib/dashboard-view";
import { formatDate } from "@/lib/format";

export default async function JogosPage() {
  const [data, session] = await Promise.all([getDashboardData(), auth()]);
  const { upcoming, previous: allPrevious } = splitMatches(data);
  const previous = allPrevious.slice(0, 15);
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <AppShell data={data} currentPath="/jogos">
      <PageHeader
        eyebrow="Agenda"
        title="Jogos"
        description="Próximos rachões, histórico recente e status de cada lista."
        actions={isAdmin ? <NovoJogoButton turmas={data.turmas} /> : undefined}
      />

      <div className="space-y-8">
        <section>
          <SectionTitle title="Próximos jogos" description="Confirmação aberta, lista fechada e sorteio." />
          {upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Sem jogos futuros"
              description={
                isAdmin
                  ? "Crie o próximo jogo para abrir confirmação e organizar a rodada."
                  : "Aguardando o próximo jogo ser agendado."
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {upcoming.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </section>

        {previous.length > 0 && (
          <section>
            <SectionTitle
              title="Jogos anteriores"
              description={`Histórico para consulta.${allPrevious.length > 15 ? ` Mostrando 15 de ${allPrevious.length}.` : ""}`}
            />
            <div className="space-y-2">
              {previous.map((match) => (
                <Link
                  key={match.id}
                  href={`/jogos/${match.id}` as never}
                  className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 transition hover:bg-white/[0.05]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
                    <CalendarDays className="h-5 w-5 text-stone-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{formatDate(match.dataJogo)}</p>
                    <p className="text-[11px] text-stone-500">{match.turmaNome}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="flex items-center gap-1 text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="font-semibold text-emerald-300">{match.confirmados}</span>
                    </div>
                    <JogoStatusBadge status={match.status} />
                    <ArrowRight className="h-4 w-4 text-stone-600" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
