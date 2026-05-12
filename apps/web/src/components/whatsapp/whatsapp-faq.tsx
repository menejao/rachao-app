"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const ITEMS = [
  {
    q: "Como adicionar o bot?",
    a: "Abra o grupo no WhatsApp, toque em Adicionar Participante e pesquise pelo número do bot. Depois envie /ativar CODIGO no grupo.",
  },
  {
    q: "O bot lê mensagens privadas?",
    a: "Não. O bot só processa mensagens nos grupos onde foi adicionado. Mensagens privadas são ignoradas.",
  },
  {
    q: "Posso usar em vários grupos?",
    a: "Sim. Cada turma tem seu próprio código de ativação e se conecta ao seu próprio grupo separadamente.",
  },
  {
    q: "Posso trocar de grupo?",
    a: "Sim. Remova o Group ID nas configurações da turma, adicione o bot ao novo grupo e envie /ativar CODIGO novamente.",
  },
  {
    q: "O que acontece se remover o bot do grupo?",
    a: "O bot para de receber mensagens, mas a conexão permanece no sistema. Adicione o bot de volta ao grupo para retomar.",
  },
  {
    q: "Como reconectar se o bot parar de responder?",
    a: "Verifique se o bot ainda está no grupo. Se precisar, reenvie /ativar CODIGO no grupo para restabelecer.",
  },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/8 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-3 text-left"
      >
        <span className="text-sm text-stone-300">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-3 text-xs leading-relaxed text-stone-500">{a}</p>
      )}
    </div>
  );
}

export function WhatsAppFaq() {
  return (
    <div className="space-y-0">
      {ITEMS.map((item) => (
        <Item key={item.q} q={item.q} a={item.a} />
      ))}
    </div>
  );
}
