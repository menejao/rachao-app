import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Table({ className, children }: { className?: string; children: ReactNode }) {
  return <table className={cn("w-full border-separate border-spacing-0", className)}>{children}</table>;
}

export function TableHead({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <th
      className={cn(
        "border-b border-white/8 px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-stone-500",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <td
      className={cn(
        "border-b border-white/6 px-4 py-4 text-sm text-stone-300",
        className
      )}
    >
      {children}
    </td>
  );
}

export function TableRow({ className, children }: { className?: string; children: ReactNode }) {
  return <tr className={cn("align-top", className)}>{children}</tr>;
}
