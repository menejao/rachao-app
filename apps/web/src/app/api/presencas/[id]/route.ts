import { NextRequest, NextResponse } from "next/server";
import type { RespostaPresenca } from "@rachao/types";
import { auth } from "@/auth";
import { updatePresenca } from "@/lib/store";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const { id } = await params;
    const body = await req.json() as { resposta: RespostaPresenca };
    if (!body.resposta) return NextResponse.json({ error: "resposta obrigatória" }, { status: 400 });

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");

      const presenca = await db.presenca.findUnique({ where: { id } });
      if (!presenca) return NextResponse.json({ error: "Presença não encontrada." }, { status: 404 });

      const jogo = await db.jogo.findUnique({ where: { id: presenca.jogoId } });

      // --- Confirmar (SIM) ---
      if (body.resposta === "SIM") {
        const limit = jogo?.limitJogadores;
        if (limit) {
          const confirmadosMain = await db.presenca.count({
            where: { jogoId: presenca.jogoId, resposta: "SIM", posicaoFila: null, id: { not: id } },
          });
          if (confirmadosMain >= limit) {
            const maxFila = await db.presenca.aggregate({
              where: { jogoId: presenca.jogoId, posicaoFila: { not: null } },
              _max: { posicaoFila: true },
            });
            const nextPos = (maxFila._max.posicaoFila ?? 0) + 1;
            await db.presenca.update({
              where: { id },
              data: { resposta: "SIM", posicaoFila: nextPos, respondeuEm: new Date() },
            });
            return NextResponse.json({ ok: true, filaPos: nextPos });
          }
        }
        await db.presenca.update({
          where: { id },
          data: { resposta: "SIM", posicaoFila: null, respondeuEm: new Date() },
        });
        return NextResponse.json({ ok: true });
      }

      // --- Sair da lista principal (era SIM sem fila) ---
      if (presenca.resposta === "SIM" && presenca.posicaoFila === null) {
        await db.presenca.update({
          where: { id },
          data: { resposta: body.resposta, posicaoFila: null, respondeuEm: new Date() },
        });
        const primeiroDaFila = await db.presenca.findFirst({
          where: { jogoId: presenca.jogoId, posicaoFila: { gt: 0 } },
          orderBy: { posicaoFila: "asc" },
        });
        if (primeiroDaFila) {
          await db.presenca.update({ where: { id: primeiroDaFila.id }, data: { posicaoFila: null } });
          await db.presenca.updateMany({
            where: { jogoId: presenca.jogoId, posicaoFila: { gt: 1 } },
            data: { posicaoFila: { decrement: 1 } },
          });
        }
        return NextResponse.json({ ok: true, promoted: primeiroDaFila?.id ?? null });
      }

      // --- Sair da fila (era SIM na fila de espera) ---
      if (presenca.resposta === "SIM" && presenca.posicaoFila !== null && presenca.posicaoFila > 0) {
        const myPos = presenca.posicaoFila;
        await db.presenca.update({
          where: { id },
          data: { resposta: body.resposta, posicaoFila: null, respondeuEm: new Date() },
        });
        await db.presenca.updateMany({
          where: { jogoId: presenca.jogoId, posicaoFila: { gt: myPos } },
          data: { posicaoFila: { decrement: 1 } },
        });
        return NextResponse.json({ ok: true });
      }

      // --- Mudança simples (PENDENTE → NAO, etc.) ---
      await db.presenca.update({
        where: { id },
        data: { resposta: body.resposta, respondeuEm: new Date() },
      });
      return NextResponse.json({ ok: true });
    }

    updatePresenca(id, body.resposta);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
