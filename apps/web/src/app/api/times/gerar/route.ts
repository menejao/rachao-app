import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateTimes } from "@/lib/store";
import { generateBalancedTeams } from "@rachao/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const body = await req.json() as { jogoId: string };
    if (!body.jogoId) return NextResponse.json({ error: "jogoId obrigatório" }, { status: 400 });

    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/prisma");

      const confirmed = await db.presenca.findMany({
        where: { jogoId: body.jogoId, resposta: "SIM" },
        include: { jogador: true },
      });

      if (confirmed.length < 2) {
        return NextResponse.json({ error: "Jogadores confirmados insuficientes para gerar times." }, { status: 400 });
      }

      const players = confirmed.map((p) => ({
        id: p.jogador.id,
        nome: p.jogador.nome,
        posicao: p.jogador.posicao,
        nivel: p.jogador.nivel,
      }));

      const generated = generateBalancedTeams(players);

      await db.time.deleteMany({ where: { jogoId: body.jogoId } });
      await db.presenca.updateMany({ where: { jogoId: body.jogoId }, data: { timeId: null } });

      const times = [];
      for (const team of generated) {
        const time = await db.time.create({
          data: {
            jogoId: body.jogoId,
            nome: team.nome,
            cor: team.cor ?? null,
            nivelMedio: team.nivelMedio,
          },
        });
        for (const player of team.jogadores) {
          await db.presenca.updateMany({
            where: { jogoId: body.jogoId, jogadorId: player.id },
            data: { timeId: time.id },
          });
        }
        times.push({ id: time.id, nome: time.nome, cor: time.cor, jogadores: team.jogadores.map((j) => j.nome) });
      }

      await db.jogo.update({ where: { id: body.jogoId }, data: { status: "TIMES_GERADOS" } });

      return NextResponse.json(times);
    }

    const times = generateTimes(body.jogoId);
    return NextResponse.json(times);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
