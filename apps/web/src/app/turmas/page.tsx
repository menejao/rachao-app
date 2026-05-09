import { auth } from "@/auth";
import { Layers3, MapPin, Users } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { AppShell } from "@/components/layout/app-shell";
import { NovaTurmaButton } from "@/components/turmas/nova-turma-button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatCurrency } from "@rachao/utils";

const DIA_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default async function TurmasPage() {
  const [data, session] = await Promise.all([getDashboardData(), auth()]);
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <AppShell data={data} currentPath="/turmas">
      <PageHeader
        eyebrow="Estrutura"
        title="Turmas"
        description="Agenda, local, mensalidade e elenco de cada equipe."
        actions={isAdmin ? <NovaTurmaButton /> : undefined}
      />

      {data.turmas.length === 0 ? (
        <EmptyState
          icon={Layers3}
          title="Sem turmas criadas"
          description="Cadastre a primeira turma para começar a operação do Rachão."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {data.turmas.map((turma) => {
            const diaNome = DIA_SEMANA[turma.diaSemana] ?? String(turma.diaSemana);
            return (
              <Card key={turma.id}>
                <CardContent className="pt-5">
                  <div className="mb-4">
                    <p className="text-lg font-bold text-white">{turma.nome}</p>
                    {turma.local && (
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-stone-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {turma.local}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/[0.04] px-3 py-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-stone-500">Dia</p>
                      <p className="mt-1 text-sm font-semibold text-white">{diaNome}</p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] px-3 py-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-stone-500">Horário</p>
                      <p className="mt-1 text-sm font-semibold text-white">{turma.horario}</p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] px-3 py-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-stone-500">Mensalidade</p>
                      <p className="mt-1 text-sm font-bold text-emerald-300">
                        {formatCurrency(turma.mensalidade)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-stone-500" />
                        <p className="text-[10px] uppercase tracking-[0.15em] text-stone-500">Elenco</p>
                      </div>
                      <p className="mt-1 text-xl font-black text-white">{turma.totalJogadores ?? 0}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        turma.status === "ATIVA"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-stone-500/10 text-stone-400"
                      }`}
                    >
                      {turma.status === "ATIVA" ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
