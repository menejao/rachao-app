"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", { email, password, redirect: false });

    setLoading(false);
    if (result?.error) {
      setError("Email ou senha incorretos.");
    } else {
      router.push((from === "/login" ? "/" : from) as never);
      router.refresh();
    }
  }

  function fillDemo(role: "admin" | "player") {
    setEmail(role === "admin" ? "admin@rachao.com" : "jogador@rachao.com");
    setPassword("123456");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#020617] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[28px] bg-gradient-to-br from-emerald-400 to-emerald-600 text-2xl font-black text-[#07110a] shadow-[0_20px_60px_rgba(34,197,94,0.35)]">
            R
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Rachao</p>
          <h1 className="mt-3 text-2xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="mt-1 text-sm text-stone-400">Entre para organizar seu rachao</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-stone-500">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-stone-600 outline-none transition focus:border-emerald-500/40 focus:bg-white/[0.06]"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-stone-500">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-stone-600 outline-none transition focus:border-emerald-500/40 focus:bg-white/[0.06]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Sem conta?{" "}
          <Link
            href={"/signup" as never}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Criar como organizador
          </Link>
        </p>

        <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <p className="mb-3 text-center text-xs uppercase tracking-widest text-stone-600">
            Acesso demo
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo("admin")}
              className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-left transition hover:bg-white/[0.06] active:scale-95"
            >
              <p className="text-xs font-semibold text-emerald-400">Organizador</p>
              <p className="mt-0.5 text-xs text-stone-500">admin@rachao.com</p>
            </button>
            <button
              type="button"
              onClick={() => fillDemo("player")}
              className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-left transition hover:bg-white/[0.06] active:scale-95"
            >
              <p className="text-xs font-semibold text-sky-400">Jogador</p>
              <p className="mt-0.5 text-xs text-stone-500">jogador@rachao.com</p>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
