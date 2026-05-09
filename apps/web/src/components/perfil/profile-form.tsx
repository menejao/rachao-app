"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

interface ProfileFormProps {
  initialName: string;
  initialPhone: string;
  email: string;
}

export function ProfileForm({ initialName, initialPhone, email }: ProfileFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const dirty = name !== initialName || phone !== initialPhone;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || null }),
      });
      if (!res.ok) throw new Error("Erro ao salvar.");
      toast("Perfil atualizado.", "success");
    } catch {
      toast("Erro ao salvar perfil.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="space-y-1.5">
        <label className="block text-xs font-medium uppercase tracking-wider text-stone-500">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-stone-600 outline-none transition focus:border-emerald-500/40 focus:bg-white/[0.06]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium uppercase tracking-wider text-stone-500">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-stone-500 outline-none cursor-not-allowed"
        />
        <p className="text-xs text-stone-600">Email não pode ser alterado.</p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium uppercase tracking-wider text-stone-500">Telefone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-stone-600 outline-none transition focus:border-emerald-500/40 focus:bg-white/[0.06]"
          placeholder="(11) 99999-0000"
        />
      </div>

      <button
        type="submit"
        disabled={!dirty || loading}
        className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
