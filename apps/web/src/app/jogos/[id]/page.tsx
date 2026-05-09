import { ArrowLeft, Calendar, CheckCircle2, Clock, Target, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { JogoStatusBadge } from "@/components/ui/jogo-status-badge";
import { MinhaPresencaCard } from "@/components/presencas/minha-presenca-card";
import { GerarTimesButton } from "@/components/matches/gerar-times-button";
import { JogoStatusButton } from "@/components/jogos/jogo-status-button";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatDate } from "@/lib/format";

const POSICAO_LABEL: Record<string, string> = {
  GOLEIRO: "GL",
  FIXO: "FX",
  ALA: "AL",
  PIVO: "PV",
  CORINGA: "CG",
};

const NIVEL_STARS = (n: number) => "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));

export default async function JogoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, session] = await Promise.all([getDashboardData(), auth()]);

  const jogo = data.jogos.find((j) => j.id === id);
  if (!jogo) notFound();

  const isAdmin = session?.user.role === "ADMIN";

  const presencas = data.presencas.filter((p) => p.jogoId === id);
  const confirmados = presencas.filter((p) => p.resposta === "SIM");
  const pendentes = presencas.filter((p) => p.resposta === "PENDENTE");
  const recusados = presencas.filter((p) => p.resposta === "NAO");
  const times = data.timesGerados.filter((t) => t.jogoId === id);

  const jogadorMap = new Map(data.jogadores.map((j) => [j.nome, j]));

  // Player's own presença
  const myJogador = data.jogadores.find((j) => j.email === session?.user.email);
  const myPresenca = myJogador ? presencas.find((p) => p.jogadorId === myJogador.id) : null;
  const canConfirm = jogo.status === "CONFIRMACAO_ABERTA";

  return (
    <AppShell data={data} currentPath="/jogos">
      {/* Back + header */}
      <div className="mb-6">
        <Link
          href={"/jogos" as never}
          className="mb-4 flex items-center gap-2 text-sm text-stone-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para jogos
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{jogo.turmaNome}</p>
            <h1 className="mt-1 text-2xl font-bold text-white">{formatDate(jogo.dataJogo)}</h1>
          </div>
          <JogoStatusBadge
            status={jogo.status}
            confirmados={jogo.confirmados}
            limite={jogo.limitJogadores ?? undefined}
            naFila={jogo.naFila}
            size="md"
          />
        </div>
      </div>

      <div className="space-y-4">
        {/* Minha presença */}
        {myPresenca && (
          <MinhaPresencaCard
            presencaId={myPresenca.id}
            resposta={myPresenca.resposta}
            posicaoFila={myPresenca.posicaoFila}
            readonly={!canConfirm}
          />
        )}

        {/* Contadores de presença */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">Lista de presença</p>
              <Users className="h-4 w-4 text-stone-500" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-center">
                <p className="text-2xl font-black text-emerald-300">{confirmados.length}</p>
                <p className="mt-0.5 text-[10px] text-stone-500">Confirmados</p>
              </div>
              <div className="rounded-2xl bg-yellow-500/10 p-3 text-center">
                <p className="text-2xl font-black text-yellow-300">{pendentes.length}</p>
                <p className="mt-0.5 text-[10px] text-stone-500">Pendentes</p>
              </div>
              <div className="rounded-2xl bg-rose-500/10 p-3 text-center">
                <p className="text-2xl font-black text-rose-300">{recusados.length}</p>
                <p className="mt-0.5 text-[10px] text-stone-500">Recusados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações do ADMIN */}
        {isAdmin && (
          <Card>
            <CardContent className="pt-5">
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-stone-500">Ações do organizador</p>
              <div className="flex flex-wrap gap-2">
                <JogoStatusButton jogoId={id} status={jogo.status as never} />
                {["CONFIRMACAO_ABERTA", "FECHADO", "TIMES_GERADOS"].includes(jogo.status) && (
                  <GerarTimesButton jogoId={id} />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Times sorteados */}
        {times.length > 0 && (
          <Card>
            <CardContent className="pt-5">
              <div className="mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-sky-400" />
                <p className="text-sm font-medium text-white">Times sorteados</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {times.map((time) => (
                  <div key={time.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-semibold text-white">{time.nome}</p>
                      <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] text-sky-400">
                        nível {time.nivelMedio.toFixed(1)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {time.jogadores.map((nome) => {
                        const j = jogadorMap.get(nome);
                        return (
                          <div key={nome} className="flex items-center gap-2">
                            <span className="flex-1 text-sm text-stone-200">{nome}</span>
                            {j && (
                              <>
                                <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-stone-400">
                                  {POSICAO_LABEL[j.posicao] ?? j.posicao}
                                </span>
                                <span className="text-[10px] tracking-tighter text-yellow-500/70">
                                  {NIVEL_STARS(j.nivel)}
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de presença detalhada */}
        {presencas.length > 0 && (
          <Card>
            <CardContent className="pt-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-stone-400" />
                  <p className="text-sm font-medium text-white">Lista completa</p>
                </div>
                <span className="text-[11px] text-stone-500">{confirmados.length} de {presencas.length}</span>
              </div>

              <div className="space-y-1">
                {confirmados.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.03]">
                    <span className="w-4 text-center text-[11px] font-bold text-emerald-500">{i + 1}</span>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="flex-1 text-sm text-stone-200">{p.jogadorNome}</span>
                    {p.timeNome && (
                      <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-400">
                        {p.timeNome}
                      </span>
                    )}
                  </div>
                ))}

                {pendentes.length > 0 && (
                  <div className="mt-2 border-t border-white/5 pt-2">
                    {pendentes.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                        <span className="w-4" />
                        <Clock className="h-4 w-4 shrink-0 text-yellow-400" />
                        <span className="flex-1 text-sm text-stone-400">{p.jogadorNome}</span>
                      </div>
                    ))}
                  </div>
                )}

                {recusados.length > 0 && (
                  <div className="mt-2 border-t border-white/5 pt-2">
                    {recusados.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                        <span className="w-4" />
                        <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                        <span className="flex-1 text-sm text-stone-500 line-through">{p.jogadorNome}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {presencas.length === 0 && (
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-stone-500">
              {isAdmin
                ? "Nenhuma presença disparada ainda. Abra a lista para começar."
                : "Lista de presença não foi aberta ainda."}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
