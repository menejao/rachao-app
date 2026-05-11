export const dynamic = 'force-dynamic';

import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { JogadoresClient } from "@/components/jogadores/jogadores-client";
import { InviteButton } from "@/components/jogadores/invite-button";
import { getDashboardData } from "@/lib/dashboard-data";
import { getTurmaNameMap } from "@/lib/dashboard-view";

export default async function JogadoresPage() {
  const [data, session] = await Promise.all([getDashboardData(), auth()]);
  const turmaNameMap = Object.fromEntries(getTurmaNameMap(data));
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <AppShell data={data} currentPath="/jogadores">
      <PageHeader
        eyebrow="Elenco"
        title="Jogadores"
        description="Base completa de atletas com filtros rápidos para a correria da organização."
        actions={isAdmin ? <InviteButton /> : undefined}
      />
      <JogadoresClient
        initialPlayers={data.jogadores}
        turmas={data.turmas}
        turmaNameMap={turmaNameMap}
      />
    </AppShell>
  );
}
