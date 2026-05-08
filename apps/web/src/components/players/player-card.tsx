import type { JogadorSummary } from "@rachao/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function PlayerCard({
  player,
  turmaNome,
  statusLabel,
}: {
  player: JogadorSummary;
  turmaNome: string;
  statusLabel: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-white">{player.nome}</p>
            <p className="mt-1 text-sm text-stone-400">{turmaNome}</p>
          </div>
          <Badge className="border-emerald-400/20 bg-emerald-500/10 text-emerald-300">{statusLabel}</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-stone-300">
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <p className="text-stone-500">Posicao</p>
            <p className="mt-1 font-medium text-white">{player.posicao}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <p className="text-stone-500">Nivel</p>
            <p className="mt-1 font-black text-white">{player.nivel}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <p className="text-stone-500">Telefone</p>
            <p className="mt-1 font-medium text-white">{player.telefone}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <p className="text-stone-500">Status</p>
            <p className="mt-1 font-medium text-white">{player.ativo ? "Ativo" : "Inativo"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
