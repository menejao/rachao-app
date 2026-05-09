import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Target,
  Trophy,
  User,
  Users,
  Volleyball,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./logout-button";
import type { UserRole } from "@/lib/permissions";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const items: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/turmas", label: "Turmas", icon: Volleyball },
  { href: "/jogadores", label: "Jogadores", icon: Users },
  { href: "/jogos", label: "Jogos", icon: ClipboardList },
  { href: "/presencas", label: "Presencas", icon: ShieldCheck },
  { href: "/times", label: "Times", icon: Target },
  { href: "/financeiro", label: "Financeiro", icon: CircleDollarSign },
  { href: "/estatisticas", label: "Estatisticas", icon: Trophy },
  { href: "/configuracoes", label: "Configuracoes", icon: Settings, adminOnly: true },
];

interface UserInfo {
  name: string;
  email: string;
  role: UserRole;
  activeTeamId: string;
}

export function Sidebar({
  currentPath,
  user,
}: {
  currentPath: string;
  user?: UserInfo;
}) {
  const role = user?.role ?? "PLAYER";
  const visibleItems = items.filter((i) => !i.adminOnly || role === "ADMIN");

  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  return (
    <aside className="sticky top-0 hidden h-screen w-[92px] shrink-0 border-r border-white/8 bg-black/30 px-4 py-6 backdrop-blur xl:block xl:w-[270px]">
      <div className="flex h-full flex-col">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-black text-[#07110a] shadow-[0_10px_30px_rgba(34,197,94,0.35)]">
            R
          </div>
          <div className="hidden xl:block">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Rachao</p>
            <p className="text-lg font-semibold text-white">
              {role === "ADMIN" ? "Organizador" : "Jogador"}
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {visibleItems.map((item) => {
            const active = currentPath === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href as never}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition",
                  active
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-stone-400 hover:bg-white/[0.05] hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border transition",
                    active
                      ? "border-emerald-400/20 bg-emerald-400/10"
                      : "border-white/5 bg-white/[0.03] group-hover:border-white/10"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="hidden xl:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden xl:block space-y-2">
          <Link
            href={"/perfil" as never}
            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3 transition hover:bg-white/[0.07]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 to-amber-500 text-xs font-black text-black">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name ?? "Usuário"}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span
                  className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    role === "ADMIN"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-sky-500/15 text-sky-400"
                  }`}
                >
                  {role === "ADMIN" ? "Admin" : "Jogador"}
                </span>
              </div>
            </div>
            <User className="h-4 w-4 text-stone-500" />
          </Link>
          <LogoutButton />
        </div>

        <div className="xl:hidden mt-4 flex flex-col items-center gap-2">
          <Link
            href={"/perfil" as never}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 to-amber-500 text-xs font-black text-black"
          >
            {initials}
          </Link>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
