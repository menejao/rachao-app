import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { PlusCircle } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-emerald-300">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-stone-400">{description}</p>
      {action ? (
        <div className="mt-5">{action}</div>
      ) : null}
    </div>
  );
}

export function EmptyStateButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400 active:scale-95"
    >
      <PlusCircle className="h-4 w-4" />
      {label}
    </button>
  );
}
