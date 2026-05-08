import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  accent = "emerald",
}: {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  accent?: "emerald" | "yellow" | "blue" | "red";
}) {
  const accents = {
    emerald: "from-emerald-400/25 to-emerald-500/0 text-emerald-300",
    yellow: "from-yellow-300/25 to-yellow-300/0 text-yellow-200",
    blue: "from-sky-400/25 to-sky-400/0 text-sky-300",
    red: "from-rose-400/25 to-rose-400/0 text-rose-300",
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="relative pt-5">
        <div className={`absolute inset-0 bg-gradient-to-br ${accents[accent]} opacity-60`} />
        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{title}</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">{value}</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-stone-400">
            <ArrowUpRight className="h-4 w-4 text-emerald-300" />
            {helper}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
