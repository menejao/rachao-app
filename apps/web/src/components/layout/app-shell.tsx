import type { DashboardData } from "@rachao/types";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

export async function AppShell({
  data,
  currentPath,
  children,
}: {
  data: DashboardData;
  currentPath: string;
  children: ReactNode;
}) {
  const session = await auth();
  const activeTurma = data.turmas[0];
  const user = session?.user
    ? {
        name: session.user.name ?? "Usuário",
        email: session.user.email ?? "",
        role: session.user.role ?? "PLAYER",
        activeTeamId: session.user.activeTeamId ?? "",
      }
    : undefined;

  return (
    <div className="min-h-screen pb-24 xl:pb-0">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar currentPath={currentPath} user={user} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            activeTurma={activeTurma?.nome ?? "Sem turma ativa"}
            user={user}
          />
          <main className="flex-1 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>

      <MobileNav currentPath={currentPath} role={user?.role} />
    </div>
  );
}
