import type { LucideIcon } from "lucide-react";
import { CircleDollarSign, ClipboardList, LayoutDashboard, ShieldCheck, User, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const items: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/jogadores", label: "Jogadores", icon: Users },
  { href: "/jogos", label: "Jogos", icon: ClipboardList },
  { href: "/presencas", label: "Presencas", icon: ShieldCheck },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function MobileNav({ currentPath }: { currentPath: string }) {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[24px] border border-white/10 bg-[#11141b]/95 px-2 py-2 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur xl:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const active = currentPath === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href as never}
              className={cn(
                "flex min-h-[60px] flex-col items-center justify-center rounded-2xl px-1 text-[11px] transition",
                active ? "bg-emerald-500/15 text-emerald-300" : "text-stone-400"
              )}
            >
              <Icon className="mb-1 h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
