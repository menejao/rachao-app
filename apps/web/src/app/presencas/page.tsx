import { PageHeader } from "@/components/common/page-header";
import { AppShell } from "@/components/layout/app-shell";
import { PresencasClient } from "@/components/presencas/presencas-client";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function PresencasPage() {
  const data = await getDashboardData();

  return (
    <AppShell data={data} currentPath="/presencas">
      <PageHeader
        eyebrow="Presencas"
        title="Quem vai, quem nao vai e quem sumiu"
        description="Clique na etiqueta de status para alternar a resposta de qualquer jogador."
      />
      <PresencasClient presencas={data.presencas} />
    </AppShell>
  );
}
