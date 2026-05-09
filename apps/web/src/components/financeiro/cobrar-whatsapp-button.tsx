"use client";

import { MessageCircle } from "lucide-react";
import { formatCurrency } from "@rachao/utils";

interface CobrarWhatsAppButtonProps {
  telefone: string;
  nome: string;
  valor: number;
  mes: number;
  ano: number;
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function CobrarWhatsAppButton({ telefone, nome, valor, mes, ano }: CobrarWhatsAppButtonProps) {
  function handle() {
    const phone = "55" + telefone.replace(/\D/g, "");
    const mesLabel = MESES[(mes - 1)] ?? String(mes);
    const msg = `Olá ${nome.split(" ")[0]}, seu pagamento de ${formatCurrency(valor)} (ref. ${mesLabel}/${ano}) está pendente no Rachão. Pode regularizar? 🙏`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <button
      onClick={handle}
      title="Cobrar via WhatsApp"
      className="flex items-center gap-1.5 rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 transition hover:bg-green-500/20 active:scale-95"
    >
      <MessageCircle className="h-3.5 w-3.5" />
      Cobrar
    </button>
  );
}
