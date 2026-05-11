import { CheckCircle2, Settings, XCircle } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { TurmaSettingsForm } from "@/components/configuracoes/turma-settings-form";
import { getDashboardData } from "@/lib/dashboard-data";
import { isWhatsAppConfigured } from "@/lib/notifications/service";

export default async function ConfiguracoesPage() {
  const [data, waConfigured] = await Promise.all([getDashboardData(), Promise.resolve(isWhatsAppConfigured())]);
  const turma = data.turmas[0];

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
              <SectionTitle title="WhatsApp" description="Integração com Meta Cloud API." />
              <div
                className={[
                  "mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3",
                  waConfigured
                    ? "border-emerald-500/20 bg-emerald-500/[0.05]"
                    : "border-rose-400/20 bg-rose-500/[0.05]",
                ].join(" ")}
              >
                {waConfigured ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <p className="text-sm text-emerald-300">Configurado e pronto para envio.</p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <p className="text-sm text-rose-300">Não configurado.</p>
                  </>
                )}
              </div>
              {!waConfigured && (
                <div className="mt-3 space-y-1.5 rounded-2xl bg-white/[0.03] px-4 py-3">
                  <p className="text-[11px] font-semibold text-stone-400">Variáveis necessárias:</p>
                  <code className="block text-[11px] text-stone-500">META_WA_PHONE_NUMBER_ID</code>
                  <code className="block text-[11px] text-stone-500">META_WA_ACCESS_TOKEN</code>
                  <code className="block text-[11px] text-stone-500">META_WA_WEBHOOK_VERIFY_TOKEN</code>
                  <p className="mt-2 text-[10px] text-stone-600">Configure em Settings → Environment Variables na Vercel.</p>
                </div>
              )}
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
