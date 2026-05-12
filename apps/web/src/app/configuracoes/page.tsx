export const dynamic = 'force-dynamic';

import { Settings } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { GeralForm } from "@/components/configuracoes/geral-form";
import { AutomacoesForm } from "@/components/configuracoes/automacoes-form";
import { PagamentosConfigForm } from "@/components/configuracoes/pagamentos-config-form";
import { ConfigTabs } from "@/components/configuracoes/config-tabs";
import { TurmaSelector } from "@/components/configuracoes/turma-selector";
import { WhatsAppOnboardingCard } from "@/components/whatsapp/whatsapp-onboarding-card";
import { WhatsAppFaq } from "@/components/whatsapp/whatsapp-faq";
import { getDashboardData } from "@/lib/dashboard-data";
import type { ConfigTab } from "@/components/configuracoes/config-tabs";

const VALID_TABS: ConfigTab[] = ["geral", "whatsapp", "automacoes", "pagamentos"];

function isValidTab(t: string | undefined): t is ConfigTab {
  return VALID_TABS.includes(t as ConfigTab);
}

const TAB_LABELS: Record<ConfigTab, { title: string; description: string }> = {
  geral: { title: "Informações gerais", description: "Nome, local, dia e horário da turma." },
  whatsapp: { title: "WhatsApp", description: "Conecte o grupo do seu rachão para automações." },
  automacoes: { title: "Automações", description: "Configure quando os avisos são enviados automaticamente." },
  pagamentos: { title: "Pagamentos", description: "Mensalidade, vencimento e cobranças automáticas." },
};

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; turmaId?: string }>;
}) {
  const { tab: rawTab, turmaId: rawTurmaId } = await searchParams;
  const activeTab: ConfigTab = isValidTab(rawTab) ? rawTab : "geral";

  const data = await getDashboardData();
  const turma = rawTurmaId
    ? (data.turmas.find((t) => t.id === rawTurmaId) ?? data.turmas[0])
    : data.turmas[0];

  const botPhone = process.env.ZAPI_BOT_PHONE ?? "NAO_CONFIGURADO";
  const info = TAB_LABELS[activeTab];

  return (
    <AppShell data={data} currentPath="/configuracoes">
      <PageHeader
        eyebrow="Ajustes"
        title="Configurações"
        description="Gerencie as informações e automações das suas turmas."
      />

      {data.turmas.length > 1 && turma && (
        <TurmaSelector turmas={data.turmas} activeTurmaId={turma.id} tab={activeTab} />
      )}

      {turma ? (
        <>
          <ConfigTabs active={activeTab} turmaId={turma.id} />

          <div className="max-w-2xl">
            <Card>
              <CardContent className="pt-5">
                <SectionTitle title={info.title} description={info.description} />

                {activeTab === "geral" && <GeralForm turma={turma} />}

                {activeTab === "whatsapp" && (
                  <div className="space-y-6">
                    <WhatsAppOnboardingCard turma={turma} botPhone={botPhone} />
                    <div className="border-t border-white/8 pt-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-500">
                        Dúvidas frequentes
                      </p>
                      <WhatsAppFaq />
                    </div>
                  </div>
                )}

                {activeTab === "automacoes" && <AutomacoesForm turma={turma} />}

                {activeTab === "pagamentos" && <PagamentosConfigForm turma={turma} />}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-[28px] border border-white/8 bg-white/[0.03] text-center">
          <Settings className="h-8 w-8 text-stone-500" />
          <p className="mt-3 text-sm text-stone-500">Nenhuma turma cadastrada.</p>
          <p className="mt-1 text-xs text-stone-600">Crie uma turma em /turmas para começar.</p>
        </div>
      )}
    </AppShell>
  );
}
