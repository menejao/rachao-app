import type { JogoSummary } from "@rachao/types";
import { ArrowRight, CheckCircle2, Clock3, XCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { JogoStatusBadge } from "@/components/ui/jogo-status-badge";
import { formatDate } from "@/lib/format";
import { GerarTimesButton } from "./gerar-times-button";

export function MatchCard({ match }: { match: JogoSummary }) {
  const total = match.confirmados + match.pendentes + match.recusados;

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-stone-500">{match.turmaNome}</p>
            <p className="mt-1 text-base font-bold text-white">{formatDate(match.dataJogo)}</p>
          </div>
          <JogoStatusBadge status={match.status} confirmados={match.confirmados} />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-1.5 rounded-2xl bg-emerald-500/10 px-3 py-2.5">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-300">{match.confirmados}</span>
            <span className="text-[11px] text-stone-500">confirmados</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl bg-white/[0.04] px-3 py-2.5">
            <Clock3 className="h-3.5 w-3.5 shrink-0 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-300">{match.pendentes}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl bg-white/[0.04] px-3 py-2.5">
            <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
            <span className="text-sm font-bold text-rose-300">{match.recusados}</span>
          </div>
        </div>

        {total > 0 && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${Math.round((match.confirmados / total) * 100)}%` }}
            />
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/jogos/${match.id}` as never}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] py-2.5 text-sm text-stone-300 transition hover:bg-white/[0.07] hover:text-white"
          >
            Ver detalhes
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {match.status !== "RASCUNHO" && <GerarTimesButton jogoId={match.id} />}
        </div>
      </CardContent>
    </Card>
  );
}
