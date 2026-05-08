import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  PAGO: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  PENDENTE: "border-yellow-400/20 bg-yellow-400/10 text-yellow-200",
  ATRASADO: "border-rose-400/20 bg-rose-500/10 text-rose-300",
  ISENTO: "border-sky-400/20 bg-sky-500/10 text-sky-300",
};

export function PaymentStatusBadge({ value }: { value: string }) {
  return <Badge className={cn(tone[value] ?? "border-white/10 bg-white/[0.04] text-stone-300")}>{value}</Badge>;
}
