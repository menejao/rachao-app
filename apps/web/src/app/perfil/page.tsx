import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { findUserById, getUserMemberships } from "@/lib/store";
import { AppShell } from "@/components/layout/app-shell";
import { getDashboardData } from "@/lib/dashboard-data";
import { PageHeader } from "@/components/common/page-header";
import { ProfileForm } from "@/components/perfil/profile-form";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/common/section-title";

export default async function PerfilPage() {
  const session = await auth();
  if (!session) redirect("/login" as never);

  const user = findUserById(session.user.id);
  const memberships = getUserMemberships(session.user.id);
  const data = await getDashboardData();

  return (
    <AppShell data={data} currentPath="/perfil">
      <PageHeader
        eyebrow="Conta"
        title="Seu perfil"
        description="Gerencie seus dados e veja suas turmas."
      />

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
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
