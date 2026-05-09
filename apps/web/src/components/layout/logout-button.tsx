"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-stone-500 transition hover:bg-white/[0.05] hover:text-rose-400"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden xl:block">Sair</span>
    </button>
  );
}
