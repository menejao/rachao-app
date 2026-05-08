import { Filter, Search, UserPlus, Users } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { ResponsiveDataView } from "@/components/common/responsive-data-view";
import { SectionTitle } from "@/components/common/section-title";
import { AppShell } from "@/components/layout/app-shell";
import { PlayerCard } from "@/components/players/player-card";
import { PlayerTable } from "@/components/players/player-table";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard-data";
import { getTurmaNameMap } from "@/lib/dashboard-view";

export default async function JogadoresPage() {
  const data = await getDashboardData();
  const turmaMap = getTurmaNameMap(data);

  return (
    <AppShell data={data} currentPath="/jogadores">
      <PageHeader
        eyebrow="Elenco"
        title="Jogadores"
        description="Base completa de atletas com filtros rapidos para correria da organizacao."
        actions={
          <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-[#07110a]">
            Adicionar jogador
          </button>
        }
      />

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <Search className="h-4 w-4 text-stone-500" />
              <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-stone-500" placeholder="Buscar por nome ou telefone" />
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-stone-300">
                <Filter className="h-4 w-4" />
                Posicao
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-stone-300">
                <UserPlus className="h-4 w-4" />
                Inadimplentes
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <SectionTitle title="Lista de jogadores" description="Tabela no desktop, cards no celular." />
        {data.jogadores.length === 0 ? (
          <EmptyState icon={Users} title="Sem jogadores ainda" description="Cadastre o primeiro elenco para comecar confirmacoes e sorteios." />
        ) : (
          <ResponsiveDataView
            desktop={<PlayerTable players={data.jogadores} turmaNameMap={turmaMap} />}
            mobile={
              <div className="space-y-4">
                {data.jogadores.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    turmaNome={turmaMap.get(player.turmaId) ?? "-"}
                    statusLabel={player.ativo ? "Ativo" : "Inativo"}
                  />
                ))}
              </div>
            }
          />
        )}
      </div>
    </AppShell>
  );
}
