import Link from "next/link";

export type ConfigTab = "geral" | "whatsapp" | "automacoes" | "pagamentos";

const TABS: { id: ConfigTab; label: string }[] = [
  { id: "geral", label: "Geral" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "automacoes", label: "Automações" },
  { id: "pagamentos", label: "Pagamentos" },
];

export function ConfigTabs({
  active,
  turmaId,
}: {
  active: ConfigTab;
  turmaId: string;
}) {
  return (
    <div className="mb-6 flex gap-1 rounded-2xl border border-white/8 bg-white/[0.03] p-1">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={`/configuracoes?tab=${tab.id}&turmaId=${turmaId}`}
          className={[
            "flex-1 rounded-xl px-3 py-2.5 text-center text-sm transition",
            active === tab.id
              ? "bg-white/10 font-medium text-white"
              : "text-stone-400 hover:text-stone-300",
          ].join(" ")}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
