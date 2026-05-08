import type { TimeSummary } from "@rachao/types";
import { Card, CardContent } from "@/components/ui/card";

export function TeamCard({
  team,
}: {
  team: TimeSummary & { playersDetailed: Array<{ nome: string; posicao: string; nivel: number }> };
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-white">{team.nome}</p>
            <p className="mt-1 text-sm text-stone-400">{team.turmaNome}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2 text-right">
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Media</p>
            <p className="mt-1 text-xl font-black text-white">{team.nivelMedio.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {team.playersDetailed.map((player) => (
            <div key={player.nome} className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-3 py-3 text-sm text-stone-300">
              <div>
                <p className="font-medium text-white">{player.nome}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">{player.posicao}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Nivel</p>
                <p className="mt-1 font-black text-white">{player.nivel}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
