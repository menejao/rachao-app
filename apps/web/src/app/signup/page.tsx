"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "account" | "team";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("account");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === "account") {
      setStep("team");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, teamName }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Erro ao criar conta.");
        setLoading(false);
        return;
      }

      await signIn("credentials", { email, password, redirect: false });
      router.push("/");
      router.refresh();
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#020617] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[28px] bg-gradient-to-br from-emerald-400 to-emerald-600 text-2xl font-black text-[#07110a] shadow-[0_20px_60px_rgba(34,197,94,0.35)]">
            R
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Rachao</p>
          <h1 className="mt-3 text-2xl font-bold text-white">
            {step === "account" ? "Criar sua conta" : "Nomear seu rachao"}
          </h1>
          <p className="mt-1 text-sm text-stone-400">
            {step === "account"
              ? "Comece como organizador"
              : "Dê um nome para sua turma"}
          </p>
        </div>

        <div className="mb-6 flex gap-1.5">
          <div className="h-1 flex-1 rounded-full bg-emerald-500" />
          <div
            className={`h-1 flex-1 rounded-full transition-colors ${step === "team" ? "bg-emerald-500" : "bg-white/10"}`}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          {step === "account" ? (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-stone-500">
                  Seu nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-stone-600 outline-none transition focus:border-emerald-500/40 focus:bg-white/[0.06]"
                  placeholder="Nome completo"
                />
              </div>
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
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-stone-600 outline-none transition focus:border-emerald-500/40 focus:bg-white/[0.06]"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <button
                type="submit"
                className="mt-2 w-full rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400 active:scale-95"
              >
                Continuar →
              </button>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-stone-500">
                  Nome do rachao
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  autoFocus
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-stone-600 outline-none transition focus:border-emerald-500/40 focus:bg-white/[0.06]"
                  placeholder="Ex: Racha da Quarta"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Criando conta..." : "Criar conta e rachao"}
              </button>
              <button
                type="button"
                onClick={() => setStep("account")}
                className="w-full text-center text-sm text-stone-500 transition hover:text-stone-300"
              >
                ← Voltar
              </button>
            </>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Já tem conta?{" "}
          <Link href={"/login" as never} className="text-emerald-400 hover:text-emerald-300">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
