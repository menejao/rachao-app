"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Fingerprint } from "lucide-react";

export function PasskeyLoginButton({
  email,
  redirectTo,
  onError,
}: {
  email: string;
  redirectTo: string;
  onError: (msg: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!email.trim()) {
      onError("Digite seu email primeiro.");
      return;
    }
    setLoading(true);
    try {
      const optRes = await fetch("/api/auth/passkey/auth-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!optRes.ok) {
        const { error } = (await optRes.json()) as { error?: string };
        onError(error ?? "Sem chave biométrica cadastrada.");
        return;
      }

      const options = await optRes.json();
      const { startAuthentication } = await import("@simplewebauthn/browser");
      const authResponse = await startAuthentication(options);

      const verifyRes = await fetch("/api/auth/passkey/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authResponse),
      });
      const { token, error } = (await verifyRes.json()) as { token?: string; error?: string };
      if (error || !token) {
        onError(error ?? "Autenticação biométrica falhou.");
        return;
      }

      const result = await signIn("passkey", { token, redirect: false });
      if (result?.error) {
        onError("Erro ao criar sessão.");
        return;
      }

      router.push(redirectTo === "/login" ? "/" : redirectTo);
      router.refresh();
    } catch (e: unknown) {
      const name = (e as Error)?.name;
      if (name === "NotAllowedError") {
        onError("Autenticação cancelada.");
      } else {
        onError("Erro na autenticação biométrica.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm font-medium text-stone-300 transition hover:bg-white/[0.06] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Fingerprint className="h-4 w-4" />
      {loading ? "Verificando..." : "Entrar com Face ID / Biometria"}
    </button>
  );
}
