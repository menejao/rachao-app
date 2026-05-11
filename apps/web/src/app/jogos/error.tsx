"use client";

import { ErrorPage } from "@/components/common/error-page";

export default function JogosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorPage error={error} reset={reset} title="Erro ao carregar jogos" />;
}
