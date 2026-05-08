import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard-data";
import { getPresenceBuckets } from "@/lib/dashboard-view";

export default async function PresencasPage() {
  const data = await getDashboardData();
  const buckets = getPresenceBuckets(data);

  return (
    <AppShell data={data} currentPath="/presencas">
      <PageHeader
        eyebrow="Presencas"
        title="Quem vai, quem nao vai e quem sumiu"
        description="Visual claro para decidir cobranca, lembrete e fechamento de lista."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <PresenceColumn
          title="Confirmados"
          icon={CheckCircle2}
          items={buckets.confirmed.map((item) => item.jogadorNome)}
          tone="text-emerald-300"
        />
        <PresenceColumn
          title="Recusados"
          icon={XCircle}
          items={buckets.refused.map((item) => item.jogadorNome)}
          tone="text-rose-300"
        />
        <PresenceColumn
          title="Pendentes"
          icon={Clock3}
          items={buckets.pending.map((item) => item.jogadorNome)}
          tone="text-yellow-200"
        />
      </div>
    </AppShell>
  );
}

function PresenceColumn({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: typeof CheckCircle2;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle title={title} description={`${items.length} jogadores`} />
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-[24px] bg-white/[0.03] px-4 py-3">
              <Icon className={`h-4 w-4 ${tone}`} />
              <span className="text-sm text-white">{item}</span>
            </div>
          ))}
          {items.length === 0 ? <p className="text-sm text-stone-500">Sem nomes nesta coluna.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
