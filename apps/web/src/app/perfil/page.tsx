import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { findUserById, getUserMemberships } from "@/lib/store";
import { AppShell } from "@/components/layout/app-shell";
import { getDashboardData } from "@/lib/dashboard-data";
import { PageHeader } from "@/components/common/page-header";
import { ProfileForm } from "@/components/perfil/profile-form";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/common/section-title";

const POSICAO_LABEL: Record<string, string> = {
  GOLEIRO: "Goleiro",
  FIXO: "Fixo",
  ALA: "Ala",
  PIVO: "Pivô",
  CORINGA: "Coringa",
};

const NIVEL_STARS = (n: number) => "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));

export default async function PerfilPage() {
  const session = await auth();
  if (!session) redirect("/login" as never);

  const user = findUserById(session.user.id);
  const memberships = getUserMemberships(session.user.id);
  const data = await getDashboardData();

  const myJogador = data.jogadores.find((j) => j.email === session.user.email);

  const myPresencas = myJogador ? data.presencas.filter((p) => p.jogadorId === myJogador.id) : [];
  const myGols = myJogador ? data.estatisticas.gols.filter((g) => g.jogadorId === myJogador.id) : [];
  const myAssists = myJogador ? data.estatisticas.gols.filter((g) => g.assistenciaId === myJogador.id) : [];
  const confirmacoes = myPresencas.filter((p) => p.resposta === "SIM").length;
  const jogosFinalizados = data.jogos.filter((j) => j.status === "FINALIZADO").length;
  const presencaPct = jogosFinalizados > 0 ? Math.round((confirmacoes / jogosFinalizados) * 100) : null;

  return (
    <AppShell data={data} currentPath="/perfil">
      <PageHeader
        eyebrow="Conta"
        title="Seu perfil"
        description="Dados pessoais, estatísticas e turmas."
      />

      <div className="space-y-6">
        {myJogador && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Posição</p>
              <p className="mt-2 text-xl font-bold text-white">
                {POSICAO_LABEL[myJogador.posicao] ?? myJogador.posicao}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Nível</p>
              <p className="mt-2 text-xl font-bold tracking-tighter text-yellow-400">
                {NIVEL_STARS(myJogador.nivel)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Gols</p>
              <p className="mt-2 text-2xl font-black text-emerald-300">{myGols.length}</p>
              {myAssists.length > 0 && (
                <p className="text-[11px] text-stone-500">{myAssists.length} assistência{myAssists.length > 1 ? "s" : ""}</p>
              )}
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Presença</p>
              <p className="mt-2 text-2xl font-black text-sky-300">
                {presencaPct !== null ? `${presencaPct}%` : `${confirmacoes}✓`}
              </p>
              {jogosFinalizados > 0 && (
                <p className="text-[11px] text-stone-500">{confirmacoes} de {jogosFinalizados} jogos</p>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardContent className="pt-6">
              <SectionTitle title="Dados pessoais" description="Seu nome e telefone visíveis na turma." />
              <ProfileForm
                initialName={user?.name ?? session.user.name ?? ""}
                initialPhone={user?.phone ?? ""}
                email={session.user.email ?? ""}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <SectionTitle title="Suas turmas" description="Turmas que você participa." />
              <div className="mt-4 space-y-3">
                {memberships.map((m) => (
                  <div
                    key={m.turmaId}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{m.turmaNome}</p>
                      <p className="text-xs text-stone-500">
                        {m.turmaId === session.user.activeTeamId ? "Ativa" : ""}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        m.role === "ADMIN"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-sky-500/10 text-sky-400"
                      }`}
                    >
                      {m.role === "ADMIN" ? "Organizador" : "Jogador"}
                    </span>
                  </div>
                ))}
                {memberships.length === 0 && (
                  <p className="py-4 text-center text-sm text-stone-500">Sem turmas vinculadas.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
