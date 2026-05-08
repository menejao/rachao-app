import type { JogoSummary } from "@rachao/types";
import { CalendarDays, UsersRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { GerarTimesButton } from "./gerar-times-button";

export function MatchCard({ match }: { match: JogoSummary }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-white">{match.turmaNome}</p>
            <p className="mt-1 text-sm text-stone-400">{match.status.replaceAll("_", " ")}</p>
          </div>
          <GerarTimesButton jogoId={match.id} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <div className="flex items-center gap-2 text-stone-400">
              <CalendarDays className="h-4 w-4" />
              Data
            </div>
            <p className="mt-2 font-medium text-white">{formatDateTime(match.dataJogo)}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <div className="flex items-center gap-2 text-stone-400">
              <UsersRound className="h-4 w-4" />
              Confirmados
            </div>
            <p className="mt-2 text-xl font-black text-white">{match.confirmados}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
