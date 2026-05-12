"use client";

import { useRouter } from "next/navigation";
import type { TurmaSummary } from "@rachao/types";
import type { ConfigTab } from "./config-tabs";

export function TurmaSelector({
  turmas,
  activeTurmaId,
  tab,
}: {
  turmas: TurmaSummary[];
  activeTurmaId: string;
  tab: ConfigTab;
}) {
  const router = useRouter();

  return (
    <div className="mb-5">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-stone-600">
        Turma
      </p>
      <div className="flex flex-wrap gap-2">
        {turmas.map((t) => (
          <button
            key={t.id}
            onClick={() => router.push(`/configuracoes?tab=${tab}&turmaId=${t.id}`)}
            className={[
              "rounded-2xl border px-4 py-2 text-sm transition",
              t.id === activeTurmaId
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-medium"
                : "border-white/10 bg-white/[0.03] text-stone-400 hover:text-white",
            ].join(" ")}
          >
            {t.nome}
          </button>
        ))}
      </div>
    </div>
  );
}
