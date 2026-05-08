import type { DashboardData } from "@rachao/types";

export async function getDashboardData(): Promise<DashboardData> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  try {
    const response = await fetch(`${apiUrl}/api/dashboard`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Dashboard unavailable");
    }

    return (await response.json()) as DashboardData;
  } catch {
    return {
      turmas: [],
      jogadores: [],
      financeiro: {
        saldoMensal: 0,
        recebidosMes: 0,
        pendentesMes: 0,
        inadimplentes: [],
        pagamentos: [],
      },
      jogos: [],
      presencas: [],
      timesGerados: [],
      estatisticas: {
        gols: [],
        artilharia: [],
        presencaRanking: [],
      },
    };
  }
}
