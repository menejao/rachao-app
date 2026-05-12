export const dynamic = 'force-dynamic';

import { Settings } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { TurmaSettingsForm } from "@/components/configuracoes/turma-settings-form";
import { WhatsAppOnboardingCard } from "@/components/whatsapp/whatsapp-onboarding-card";
import { WhatsAppFaq } from "@/components/whatsapp/whatsapp-faq";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function ConfiguracoesPage() {
  const data = await getDashboardData();
  const turma = data.turmas[0];
  const botPhone = process.env.ZAPI_BOT_PHONE ?? "NAO_CONFIGURADO";

  return (
    <AppShell data={data} currentPath="/configuracoes">
      <PageHeader
        eyebrow="Ajustes"
        title="Configuracoes"
        description="Ajuste os parametros da turma ativa. Alteracoes sao salvas imediatamente."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-5">
            <SectionTitle title="Turma ativa" description="Nome, local, horario e mensalidade." />
            {turma ? (
              <TurmaSettingsForm turma={turma} />
            ) : (
              <div className="flex min-h-[160px] flex-col items-center justify-center rounded-[24px] bg-white/[0.03] text-center">
                <Settings className="h-8 w-8 text-stone-500" />
                <p className="mt-3 text-sm text-stone-500">Nenhuma turma cadastrada ainda.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-5">
              <SectionTitle title="WhatsApp" description="Integracao com grupo do seu rachao." />
              {turma ? (
                <div className="mt-4">
                  <WhatsAppOnboardingCard turma={turma} botPhone={botPhone} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-stone-500">Crie uma turma primeiro.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <SectionTitle title="Duvidas frequentes" description="Como funciona a integracao WhatsApp." />
              <div className="mt-3">
                <WhatsAppFaq />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <SectionTitle title="Operacao" description="Modo de envio e automacoes." />
              <div className="mt-3 space-y-3">
                <SettingRow title="Disparo dominical" value="Domingo 20h (cron configuravel)" />
                <SettingRow title="Lembrete de pendentes" value="Terca 18h" />
                <SettingRow title="Fechamento de lista" value="Quarta 10h" />
                <SettingRow title="Geracao de times" value="Quarta 10h01 (automatico)" />
              </div>
              <p className="mt-4 text-xs text-stone-600">
                Para alterar crons, configure as variaveis de ambiente CRON_* na plataforma de deploy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function SettingRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[24px] bg-white/[0.03] px-4 py-3">
      <p className="text-sm text-stone-400">{title}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}
