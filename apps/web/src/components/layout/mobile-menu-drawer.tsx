"use client";

import type { LucideIcon } from "lucide-react";
import { BarChart3, LogOut, Menu, Settings, Target, User, Users, Volleyball, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/permissions";

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { href: "/jogadores", label: "Jogadores", icon: Users, adminOnly: true },
  { href: "/turmas", label: "Turmas", icon: Volleyball, adminOnly: true },
  { href: "/times", label: "Times", icon: Target },
  { href: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
  { href: "/configuracoes", label: "Config.", icon: Settings, adminOnly: true },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function MobileMenuDrawer({
  currentPath,
  role = "PLAYER",
}: {
  currentPath: string;
  role?: UserRole;
}) {
  const [open, setOpen] = useState(false);

  const visible = menuItems.filter((i) => !i.adminOnly || role === "ADMIN");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex min-h-[60px] flex-col items-center justify-center rounded-2xl px-1 text-[11px] transition",
          open ? "bg-emerald-500/15 text-emerald-300" : "text-stone-400"
        )}
      >
        <Menu className="mb-1 h-4 w-4" />
        Menu
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-3 bottom-24 z-50 rounded-3xl border border-white/10 bg-[#11141b] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
                Mais opções
              </p>
              <button onClick={() => setOpen(false)}>
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {visible.map((item) => {
                const Icon = item.icon;
                const active = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href as never}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl p-3 text-[11px] transition",
                      active
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-white/[0.04] text-stone-300 hover:bg-white/[0.08]"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex flex-col items-center gap-2 rounded-2xl bg-rose-500/10 p-3 text-[11px] text-rose-400 transition hover:bg-rose-500/20"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
