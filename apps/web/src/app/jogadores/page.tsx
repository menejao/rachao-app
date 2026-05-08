import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { JogadoresClient } from "@/components/jogadores/jogadores-client";
import { getDashboardData } from "@/lib/dashboard-data";
import { getTurmaNameMap } from "@/lib/dashboard-view";

export default async function JogadoresPage() {
  const data = await getDashboardData();
  const turmaNameMap = Object.fromEntries(getTurmaNameMap(data));

  return (
    <AppShell data={data} currentPath="/jogadores">
      <PageHeader
        eyebrow="Elenco"
        title="Jogadores"
        description="Base completa de atletas com filtros rapidos para correria da organizacao."
      />
      <JogadoresClient
        initialPlayers={data.jogadores}
        turmas={data.turmas}
        turmaNameMap={turmaNameMap}
      />
    </AppShell>
  );
}
