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
  Users,
  Volleyball,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const items: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/turmas", label: "Turmas", icon: Volleyball },
  { href: "/jogadores", label: "Jogadores", icon: Users },
  { href: "/jogos", label: "Jogos", icon: ClipboardList },
  { href: "/presencas", label: "Presencas", icon: ShieldCheck },
  { href: "/times", label: "Times", icon: Target },
  { href: "/financeiro", label: "Financeiro", icon: CircleDollarSign },
  { href: "/estatisticas", label: "Estatisticas", icon: Trophy },
  { href: "/configuracoes", label: "Configuracoes", icon: Settings },
];

export function Sidebar({ currentPath }: { currentPath: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[92px] shrink-0 border-r border-white/8 bg-black/30 px-4 py-6 backdrop-blur xl:block xl:w-[270px]">
      <div className="flex h-full flex-col">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-black text-[#07110a] shadow-[0_10px_30px_rgba(34,197,94,0.35)]">
            R
          </div>
          <div className="hidden xl:block">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Rachao</p>
            <p className="text-lg font-semibold text-white">Organizador</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {items.map((item) => {
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

        <div className="hidden rounded-3xl border border-white/8 bg-white/[0.04] p-4 xl:block">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Modo</p>
          <p className="mt-2 text-sm font-medium text-white">Operacao de jogo</p>
          <p className="mt-1 text-sm text-stone-400">Tudo em um painel rapido para resenha, caixa e sorteio.</p>
        </div>
      </div>
    </aside>
  );
}
