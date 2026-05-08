import { Bell, ChevronDown, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Topbar({ activeTurma }: { activeTurma: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0b0d12]/85 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="xl:hidden">
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">Rachao</p>
            <p className="text-lg font-semibold text-white">Organizador</p>
          </div>

          <div className="hidden xl:block">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Turma ativa</p>
            <button className="mt-1 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white">
              {activeTurma}
              <ChevronDown className="h-4 w-4 text-stone-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 sm:min-w-[220px] sm:flex-none">
            <Search className="h-4 w-4 text-stone-500" />
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-stone-500"
              placeholder="Buscar jogador, jogo ou cobranca"
            />
          </div>

          <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-stone-300">
            <Bell className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">Joao</p>
              <p className="text-xs text-stone-500">Organizador</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 text-sm font-black text-black">
              JB
            </div>
          </div>
        </div>

        <div className="xl:hidden">
          <Badge className="border-emerald-400/20 bg-emerald-500/10 text-emerald-300">{activeTurma}</Badge>
        </div>
      </div>
    </header>
  );
}
