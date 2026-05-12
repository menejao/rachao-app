"use client";

import { useState } from "react";
import { Fingerprint, Check, X } from "lucide-react";

export function PasskeyRegisterButton() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleRegister() {
    setState("loading");
    setErrorMsg("");
    try {
      const optRes = await fetch("/api/auth/passkey/register-options", { method: "POST" });
      if (!optRes.ok) {
        setErrorMsg("Erro ao iniciar cadastro.");
        setState("error");
        return;
      }
      const options = await optRes.json();

      const { startRegistration } = await import("@simplewebauthn/browser");
      const regResponse = await startRegistration(options);

      const verifyRes = await fetch("/api/auth/passkey/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regResponse),
      });
      const { ok, error } = (await verifyRes.json()) as { ok?: boolean; error?: string };
      if (!ok) {
        setErrorMsg(error ?? "Registro falhou.");
        setState("error");
        return;
      }

      setState("success");
      setTimeout(() => setState("idle"), 3000);
    } catch (e: unknown) {
      const name = (e as Error)?.name;
      if (name === "NotAllowedError") {
        setErrorMsg("Operação cancelada.");
      } else if (name === "InvalidStateError") {
        setErrorMsg("Este dispositivo já está cadastrado.");
      } else {
        setErrorMsg("Erro ao cadastrar biometria.");
      }
      setState("error");
      setTimeout(() => setState("idle"), 4000);
    }
  }

  if (state === "success") {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-3 text-sm text-emerald-300">
        <Check className="h-4 w-4" />
        Face ID / biometria cadastrada com sucesso!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleRegister}
        disabled={state === "loading"}
        className="flex w-full items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-stone-300 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
      >
        <Fingerprint className="h-4 w-4 shrink-0" />
        {state === "loading" ? "Aguardando biometria..." : "Adicionar Face ID / Biometria"}
      </button>
      {state === "error" && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/[0.05] px-4 py-3 text-sm text-rose-300">
          <X className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
