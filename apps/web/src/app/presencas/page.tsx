import { auth } from "@/auth";
import { PageHeader } from "@/components/common/page-header";
import { AppShell } from "@/components/layout/app-shell";
import { MinhaPresencaCard } from "@/components/presencas/minha-presenca-card";
import { PresencasClient } from "@/components/presencas/presencas-client";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function PresencasPage() {
  const [data, session] = await Promise.all([getDashboardData(), auth()]);
  const isAdmin = session?.user.role === "ADMIN";

  const nextJogo = data.jogos.find((j) =>
    ["RASCUNHO", "CONFIRMACAO_ABERTA", "FECHADO", "TIMES_GERADOS"].includes(j.status)
  );

  const myJogador = data.jogadores.find((j) => j.email === session?.user.email);
  const myPresenca =
    nextJogo && myJogador
      ? data.presencas.find((p) => p.jogadorId === myJogador.id && p.jogoId === nextJogo.id)
      : null;
  const canConfirm = nextJogo?.status === "CONFIRMACAO_ABERTA";

  return (
    <AppShell data={data} currentPath="/presencas">
      <PageHeader
        eyebrow="Presenças"
        title="Quem vai jogar"
        description={
          isAdmin
            ? "Clique no status para alterar a resposta de qualquer jogador."
            : "Confirme sua presença para o próximo jogo."
        }
      />

      <div className="space-y-6">
        {!isAdmin && myPresenca && (
          <MinhaPresencaCard
            presencaId={myPresenca.id}
            resposta={myPresenca.resposta}
            posicaoFila={myPresenca.posicaoFila}
            readonly={!canConfirm}
          />
        )}

        <PresencasClient presencas={data.presencas} readonly={!isAdmin} />
      </div>
    </AppShell>
  );
}
