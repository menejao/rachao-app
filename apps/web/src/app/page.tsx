import { AlertTriangle, ArrowRight, CalendarDays, CircleDollarSign, Users } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DisbararButton } from "@/components/dashboard/disparar-button";
import { getDashboardData } from "@/lib/dashboard-data";
import { getOrganizerAlerts } from "@/lib/dashboard-view";
import { formatCurrency } from "@rachao/utils";
import { formatDate } from "@/lib/format";

export default async function HomePage() {
  const [data, session] = await Promise.all([getDashboardData(), auth()]);

  const role = session?.user.role ?? "PLAYER";
  const isAdmin = role === "ADMIN";
  const firstName = (session?.user.name ?? "Usuário").split(" ")[0];

  const nextJogo = data.jogos.find((j) =>
    ["RASCUNHO", "CONFIRMACAO_ABERTA", "FECHADO", "TIMES_GERADOS"].includes(j.status)
  );

  const alerts = isAdmin ? getOrganizerAlerts(data) : [];

  const jogoInfo = nextJogo
    ? { turmaId: nextJogo.turmaId, dataJogo: nextJogo.dataJogo, turmaNome: nextJogo.turmaNome }
    : null;

  const statusLabel: Record<string, string> = {
    RASCUNHO: "Rascunho",
    CONFIRMACAO_ABERTA: "Lista aberta",
    FECHADO: "Lista fechada",
    TIMES_GERADOS: "Times sorteados",
    FINALIZADO: "Finalizado",
  };

  const statusColor: Record<string, string> = {
    RASCUNHO: "text-stone-400",
    CONFIRMACAO_ABERTA: "text-emerald-400",
    FECHADO: "text-yellow-400",
    TIMES_GERADOS: "text-sky-400",
    FINALIZADO: "text-stone-500",
  };

  return (
    <AppShell data={data} currentPath="/">
      {/* Welcome */}
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.25em] text-stone-500">
          {data.turmas[0]?.nome ?? "Sem turma ativa"}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">
          Olá, {firstName}!
        </h1>
      </div>

      <div className="space-y-4">
        {/* Próximo jogo */}
        {nextJogo ? (
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
                    Próximo jogo
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    {formatDate(nextJogo.dataJogo)}
                  </p>
                </div>
                <span
                  className={`rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium ${statusColor[nextJogo.status] ?? "text-stone-400"}`}
                >
                  {statusLabel[nextJogo.status] ?? nextJogo.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-3 text-center">
                  <p className="text-xl font-black text-emerald-300">
                    {nextJogo.confirmados}
                  </p>
                  <p className="mt-0.5 text-[10px] text-stone-500">Confirmados</p>
                </div>
                <div className="rounded-2xl bg-yellow-500/10 p-3 text-center">
                  <p className="text-xl font-black text-yellow-300">
                    {nextJogo.pendentes}
                  </p>
                  <p className="mt-0.5 text-[10px] text-stone-500">Pendentes</p>
                </div>
                <div className="rounded-2xl bg-rose-500/10 p-3 text-center">
                  <p className="text-xl font-black text-rose-300">
                    {nextJogo.recusados}
                  </p>
                  <p className="mt-0.5 text-[10px] text-stone-500">Recusados</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/jogos/${nextJogo.id}` as never}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm text-white transition hover:bg-white/[0.07]"
                >
                  Ver detalhes
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {isAdmin && nextJogo.status === "CONFIRMACAO_ABERTA" && (
                  <DisbararButton jogoInfo={jogoInfo} />
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                  <CalendarDays className="h-5 w-5 text-stone-500" />
                </div>
                <div>
                  <p className="font-medium text-white">Sem jogo agendado</p>
                  <p className="text-sm text-stone-500">
                    {isAdmin ? "Crie um novo jogo para começar." : "Aguardando o próximo jogo."}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <Link
                  href={"/jogos" as never}
                  className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400"
                >
                  Criar jogo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Resumo financeiro */}
        <Card>
          <CardContent className="pt-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
              Caixa do mês
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="h-5 w-5 text-emerald-400" />
                <span className="text-xl font-black text-white">
                  {formatCurrency(data.financeiro.saldoMensal)}
                </span>
              </div>
              <Link
                href={"/financeiro" as never}
                className="flex items-center gap-1 text-sm text-stone-400 transition hover:text-white"
              >
                Ver financeiro
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {isAdmin && data.financeiro.inadimplentes.length > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-rose-400/15 bg-rose-500/[0.06] px-3 py-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <p className="text-sm text-rose-200">
                  {data.financeiro.inadimplentes.length} jogador
                  {data.financeiro.inadimplentes.length > 1 ? "es" : ""} inadimplente
                  {data.financeiro.inadimplentes.length > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas do organizador */}
        {isAdmin && alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert}
                className="flex items-start gap-3 rounded-2xl border border-yellow-400/15 bg-yellow-500/[0.06] px-4 py-3"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                <p className="text-sm text-yellow-200">{alert}</p>
              </div>
            ))}
          </div>
        )}

        {/* Atalhos rápidos */}
        {isAdmin && (
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-stone-500">
              Acesso rápido
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Link
                href={"/jogadores" as never}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
              >
                <Users className="h-5 w-5 text-stone-400" />
                <span className="text-sm text-white">Jogadores</span>
              </Link>
              <Link
                href={"/jogos" as never}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
              >
                <CalendarDays className="h-5 w-5 text-stone-400" />
                <span className="text-sm text-white">Jogos</span>
              </Link>
              <Link
                href={"/financeiro" as never}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
              >
                <CircleDollarSign className="h-5 w-5 text-stone-400" />
                <span className="text-sm text-white">Financeiro</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
