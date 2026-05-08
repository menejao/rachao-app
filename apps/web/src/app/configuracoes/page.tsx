import { Settings } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function ConfiguracoesPage() {
  const data = await getDashboardData();

  return (
    <AppShell data={data} currentPath="/configuracoes">
      <PageHeader
        eyebrow="Ajustes"
        title="Configuracoes"
        description="Espaco visual para provider, jobs, turma ativa e preferencias do organizador."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-5">
            <SectionTitle title="Operacao" description="Controles principais do ambiente." />
            <div className="space-y-3">
              <SettingRow title="Modo de envio" value="Dry-run" />
              <SettingRow title="Provider" value="Mock / Evolution / Z-API" />
              <SettingRow title="Jobs semanais" value="Configuravel por cron" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <SectionTitle title="Conta do organizador" description="Dados de perfil e acesso." />
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[24px] bg-white/[0.03] text-center">
              <Settings className="h-8 w-8 text-stone-500" />
              <p className="mt-4 text-lg font-semibold text-white">Base pronta para configuracoes futuras</p>
              <p className="mt-2 max-w-sm text-sm text-stone-500">Aqui entram preferencias, acesso e parametros de automacao.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function SettingRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[24px] bg-white/[0.03] px-4 py-4">
      <p className="text-sm text-stone-400">{title}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}
