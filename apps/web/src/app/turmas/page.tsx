import { Layers3 } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { AppShell } from "@/components/layout/app-shell";
import { NovaTurmaButton } from "@/components/turmas/nova-turma-button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatCurrency } from "@rachao/utils";

export default async function TurmasPage() {
  const data = await getDashboardData();

  return (
    <AppShell data={data} currentPath="/turmas">
      <PageHeader
        eyebrow="Estrutura"
        title="Turmas"
        description="Cada turma com cara de squad: agenda, local, mensalidade e tamanho do elenco."
        actions={<NovaTurmaButton />}
      />

      {data.turmas.length === 0 ? (
        <EmptyState icon={Layers3} title="Sem turmas criadas" description="Cadastre a primeira turma para comecar a operacao do Rachao." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {data.turmas.map((turma) => (
            <Card key={turma.id}>
              <CardContent className="pt-5">
                <SectionTitle title={turma.nome} description={turma.local ?? "Local a definir"} />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white/[0.04] p-3">
                    <p className="text-stone-500">Horario</p>
                    <p className="mt-1 font-medium text-white">{turma.horario}</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.04] p-3">
                    <p className="text-stone-500">Dia</p>
                    <p className="mt-1 font-medium text-white">{turma.diaSemana}</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.04] p-3">
                    <p className="text-stone-500">Mensalidade</p>
                    <p className="mt-1 font-medium text-white">{formatCurrency(turma.mensalidade)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.04] p-3">
                    <p className="text-stone-500">Jogadores</p>
                    <p className="mt-1 font-black text-white">{turma.totalJogadores ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
