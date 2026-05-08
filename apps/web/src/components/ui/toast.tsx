"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const styles: Record<ToastType, string> = {
    success: "border-emerald-400/25 bg-[#0d1f14] text-emerald-100",
    error: "border-rose-400/25 bg-[#1f0d0d] text-rose-100",
    info: "border-white/10 bg-[#111827] text-stone-200",
  };

  const Icon = item.type === "success" ? CheckCircle2 : item.type === "error" ? XCircle : null;
  const iconClass = item.type === "success" ? "text-emerald-400" : item.type === "error" ? "text-rose-400" : "";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-sm ${styles[item.type]}`}
    >
      {Icon && <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} />}
      <p className="flex-1 text-sm leading-relaxed">{item.message}</p>
      <button
        onClick={onDismiss}
        className="ml-1 shrink-0 opacity-50 transition hover:opacity-100"
        aria-label="Fechar"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-24 right-4 z-[200] flex w-80 flex-col gap-2 lg:bottom-5">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast item={t} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
