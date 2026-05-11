"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

interface Props {
  initials: string;
  name: string;
  role: string;
}

export function AvatarDropdown({ initials, name, role }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 transition hover:bg-white/[0.07]"
      >
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-stone-500">
            {role === "ADMIN" ? "Organizador" : "Jogador"}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 text-sm font-black text-black">
          {initials}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#0e1420] shadow-2xl">
          <Link
            href={"/perfil" as never}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-stone-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            <User className="h-4 w-4 shrink-0" />
            Meu perfil
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-stone-300 transition hover:bg-white/[0.06] hover:text-rose-400"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
