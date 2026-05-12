import { PrismaClient, Posicao } from "@prisma/client";

// Use direct connection (not pgbouncer pool) for seed — avoids connection_limit=1 constraint
const db = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
});

// bcrypt hash for "senha123"
const PASSWORD_HASH = "$2a$10$cEXrECWcM3koYgttDrM5VuOWgrqvY1Qd9Uz4LKHNnXsGGCPaWmWoe";

function hashPhone(n: number) {
  return `5511${String(90000000 + n).padStart(8, "0")}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(20, 0, 0, 0);
  return d;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(20, 0, 0, 0);
  return d;
}

const JOGADORES_DATA: { nome: string; posicao: Posicao; nivel: number }[] = [
  { nome: "Carlos Mendes",    posicao: "GOLEIRO",  nivel: 4 },
  { nome: "Ricardo Lima",     posicao: "GOLEIRO",  nivel: 3 },
  { nome: "Thiago Ferreira",  posicao: "FIXO",     nivel: 5 },
  { nome: "Bruno Oliveira",   posicao: "FIXO",     nivel: 4 },
  { nome: "Felipe Andrade",   posicao: "FIXO",     nivel: 3 },
  { nome: "Mateus Costa",     posicao: "FIXO",     nivel: 2 },
  { nome: "Gustavo Santos",   posicao: "ALA",      nivel: 5 },
  { nome: "Rafael Souza",     posicao: "ALA",      nivel: 4 },
  { nome: "Leonardo Rocha",   posicao: "ALA",      nivel: 4 },
  { nome: "Diego Alves",      posicao: "ALA",      nivel: 3 },
  { nome: "Victor Pereira",   posicao: "ALA",      nivel: 3 },
  { nome: "Anderson Silva",   posicao: "ALA",      nivel: 2 },
  { nome: "Rodrigo Carvalho", posicao: "PIVO",     nivel: 5 },
  { nome: "Marcos Nunes",     posicao: "PIVO",     nivel: 4 },
  { nome: "Paulo Ribeiro",    posicao: "PIVO",     nivel: 3 },
  { nome: "Henrique Dias",    posicao: "CORINGA",  nivel: 4 },
  { nome: "Alexandre Moura",  posicao: "CORINGA",  nivel: 3 },
  { nome: "Leandro Gomes",    posicao: "CORINGA",  nivel: 2 },
];

async function main() {
  console.log("🌱 Limpando dados existentes...");

  await db.gol.deleteMany();
  await db.presenca.deleteMany();
  await db.time.deleteMany();
  await db.jogo.deleteMany();
  await db.pagamento.deleteMany();
  await db.jogador.deleteMany();
  await db.invite.deleteMany();
  await db.membership.deleteMany();
  await db.userNotificationPreference.deleteMany();
  await db.notificationLog.deleteMany();
  await db.eventoLog.deleteMany();
  await db.turma.deleteMany();
  await db.user.deleteMany();

  console.log("👤 Criando usuários...");

  const admin = await db.user.create({
    data: {
      name: "João Organizador",
      email: "admin@rachao.app",
      passwordHash: PASSWORD_HASH,
      phone: "5511999990001",
    },
  });

  // 5 player users that will be linked to jogadores
  const playerUsersData = [
    { name: "Thiago Ferreira",  email: "thiago@rachao.app",  phone: hashPhone(2) },
    { name: "Gustavo Santos",   email: "gustavo@rachao.app", phone: hashPhone(3) },
    { name: "Rodrigo Carvalho", email: "rodrigo@rachao.app", phone: hashPhone(4) },
    { name: "Carlos Mendes",    email: "carlos@rachao.app",  phone: hashPhone(5) },
    { name: "Rafael Souza",     email: "rafael@rachao.app",  phone: hashPhone(6) },
  ];
  const playerUsers = [];
  for (const u of playerUsersData) {
    playerUsers.push(await db.user.create({ data: { ...u, passwordHash: PASSWORD_HASH } }));
  }

  console.log("🏟️ Criando turma...");

  const turma = await db.turma.create({
    data: {
      nome: "Rachão da Terça",
      local: "Arena Futsal Centro",
      diaSemana: 2,
      horario: "20:00",
      mensalidade: 60,
      status: "ATIVA",
    },
  });

  console.log("🔗 Criando memberships...");

  await db.membership.create({ data: { userId: admin.id, turmaId: turma.id, role: "ADMIN" } });
  for (const u of playerUsers) {
    await db.membership.create({ data: { userId: u.id, turmaId: turma.id, role: "PLAYER" } });
  }

  console.log("⚽ Criando jogadores...");

  const emailMap: Record<string, string> = {
    "Thiago Ferreira":  "thiago@rachao.app",
    "Gustavo Santos":   "gustavo@rachao.app",
    "Rodrigo Carvalho": "rodrigo@rachao.app",
    "Carlos Mendes":    "carlos@rachao.app",
    "Rafael Souza":     "rafael@rachao.app",
  };

  const jogadores = [];
  for (const [i, j] of JOGADORES_DATA.entries()) {
    jogadores.push(await db.jogador.create({
      data: {
        turmaId: turma.id,
        nome: j.nome,
        telefone: hashPhone(10 + i),
        email: emailMap[j.nome] ?? null,
        posicao: j.posicao,
        nivel: j.nivel,
        ativo: i < 17,
      },
    }));
  }

  const now = new Date();
  const currentMes = now.getMonth() + 1;
  const currentAno = now.getFullYear();

  function prevMonth(offset: number) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - offset);
    return { mes: d.getMonth() + 1, ano: d.getFullYear() };
  }

  console.log("💰 Criando pagamentos...");

  const ativos = jogadores.filter((j) => j.ativo);

  const m3 = prevMonth(3);
  const m2 = prevMonth(2);
  const m1 = prevMonth(1);

  await db.pagamento.createMany({
    data: ativos.map((j) => ({ turmaId: turma.id, jogadorId: j.id, referenciaMes: m3.mes, referenciaAno: m3.ano, valor: 60, status: "PAGO" as const, pagoEm: daysAgo(95) })),
  });

  await db.pagamento.createMany({
    data: ativos.map((j, i) => ({ turmaId: turma.id, jogadorId: j.id, referenciaMes: m2.mes, referenciaAno: m2.ano, valor: 60, status: (i < 13 ? "PAGO" : "ATRASADO") as const, pagoEm: i < 13 ? daysAgo(62) : null })),
  });

  await db.pagamento.createMany({
    data: ativos.map((j, i) => ({ turmaId: turma.id, jogadorId: j.id, referenciaMes: m1.mes, referenciaAno: m1.ano, valor: 60, status: (i < 10 ? "PAGO" : "PENDENTE") as const, pagoEm: i < 10 ? daysAgo(30) : null })),
  });

  await db.pagamento.createMany({
    data: ativos.map((j, i) => ({ turmaId: turma.id, jogadorId: j.id, referenciaMes: currentMes, referenciaAno: currentAno, valor: 60, status: (i < 6 ? "PAGO" : "PENDENTE") as const, pagoEm: i < 6 ? daysAgo(5) : null })),
  });

  console.log("🏆 Criando jogos passados...");

  // ---- Jogo 1: 6 semanas atrás — FINALIZADO com times e gols ----
  const jogo1 = await db.jogo.create({
    data: {
      turmaId: turma.id,
      dataJogo: daysAgo(42),
      status: "FINALIZADO",
      limitJogadores: 14,
    },
  });

  const confirmados1 = jogadores.slice(0, 14);
  const recusados1 = jogadores.slice(14, 17);

  await db.presenca.createMany({
    data: [
      ...confirmados1.map((j) => ({ jogoId: jogo1.id, jogadorId: j.id, resposta: "SIM" as const, respondeuEm: daysAgo(44) })),
      ...recusados1.map((j) => ({ jogoId: jogo1.id, jogadorId: j.id, resposta: "NAO" as const, respondeuEm: daysAgo(43) })),
    ],
  });

  const time1A = await db.time.create({
    data: { jogoId: jogo1.id, nome: "Time Azul", cor: "azul", nivelMedio: 3.71 },
  });
  const time1B = await db.time.create({
    data: { jogoId: jogo1.id, nome: "Time Laranja", cor: "laranja", nivelMedio: 3.57 },
  });

  const team1A = confirmados1.slice(0, 7);
  const team1B = confirmados1.slice(7, 14);
  await db.presenca.updateMany({ where: { jogoId: jogo1.id, jogadorId: { in: team1A.map((j) => j.id) } }, data: { timeId: time1A.id } });
  await db.presenca.updateMany({ where: { jogoId: jogo1.id, jogadorId: { in: team1B.map((j) => j.id) } }, data: { timeId: time1B.id } });

  await db.gol.createMany({
    data: [
      { jogoId: jogo1.id, jogadorId: confirmados1[2]!.id, assistenciaId: confirmados1[6]!.id, minuto: 8 },
      { jogoId: jogo1.id, jogadorId: confirmados1[12]!.id, assistenciaId: null, minuto: 15 },
      { jogoId: jogo1.id, jogadorId: confirmados1[6]!.id, assistenciaId: confirmados1[8]!.id, minuto: 22 },
      { jogoId: jogo1.id, jogadorId: confirmados1[2]!.id, assistenciaId: confirmados1[3]!.id, minuto: 31 },
      { jogoId: jogo1.id, jogadorId: confirmados1[9]!.id, assistenciaId: null, minuto: 38 },
      { jogoId: jogo1.id, jogadorId: confirmados1[12]!.id, assistenciaId: confirmados1[13]!.id, minuto: 44 },
    ],
  });

  // ---- Jogo 2: 4 semanas atrás — FINALIZADO ----
  const jogo2 = await db.jogo.create({
    data: {
      turmaId: turma.id,
      dataJogo: daysAgo(28),
      status: "FINALIZADO",
      limitJogadores: 14,
    },
  });

  const confirmados2 = [...jogadores.slice(0, 12), jogadores[14]!, jogadores[15]!];
  const recusados2 = [jogadores[12]!, jogadores[13]!];
  const pendentes2 = [jogadores[16]!];

  await db.presenca.createMany({
    data: [
      ...confirmados2.map((j) => ({ jogoId: jogo2.id, jogadorId: j.id, resposta: "SIM" as const, respondeuEm: daysAgo(29) })),
      ...recusados2.map((j) => ({ jogoId: jogo2.id, jogadorId: j.id, resposta: "NAO" as const, respondeuEm: daysAgo(28) })),
      ...pendentes2.map((j) => ({ jogoId: jogo2.id, jogadorId: j.id, resposta: "PENDENTE" as const })),
    ],
  });

  const time2A = await db.time.create({ data: { jogoId: jogo2.id, nome: "Time Azul", cor: "azul", nivelMedio: 3.57 } });
  const time2B = await db.time.create({ data: { jogoId: jogo2.id, nome: "Time Laranja", cor: "laranja", nivelMedio: 3.71 } });

  await db.presenca.updateMany({ where: { jogoId: jogo2.id, jogadorId: { in: confirmados2.slice(0, 7).map((j) => j.id) } }, data: { timeId: time2A.id } });
  await db.presenca.updateMany({ where: { jogoId: jogo2.id, jogadorId: { in: confirmados2.slice(7).map((j) => j.id) } }, data: { timeId: time2B.id } });

  await db.gol.createMany({
    data: [
      { jogoId: jogo2.id, jogadorId: confirmados2[6]!.id, assistenciaId: confirmados2[0]!.id, minuto: 5 },
      { jogoId: jogo2.id, jogadorId: confirmados2[12]!.id, assistenciaId: null, minuto: 12 },
      { jogoId: jogo2.id, jogadorId: confirmados2[2]!.id, assistenciaId: confirmados2[4]!.id, minuto: 19 },
      { jogoId: jogo2.id, jogadorId: confirmados2[6]!.id, assistenciaId: null, minuto: 27 },
      { jogoId: jogo2.id, jogadorId: confirmados2[7]!.id, assistenciaId: confirmados2[11]!.id, minuto: 35 },
    ],
  });

  // ---- Jogo 3: 2 semanas atrás — FINALIZADO (sem times registrados) ----
  const jogo3 = await db.jogo.create({
    data: {
      turmaId: turma.id,
      dataJogo: daysAgo(14),
      status: "FINALIZADO",
    },
  });

  await db.presenca.createMany({
    data: ativos.map((j, i) => ({ jogoId: jogo3.id, jogadorId: j.id, resposta: (i < 15 ? "SIM" : "NAO") as const, respondeuEm: daysAgo(15) })),
  });

  // ---- Jogo 4: próxima terça — CONFIRMACAO_ABERTA com fila de espera ----
  console.log("📅 Criando próximo jogo com fila...");

  const jogo4 = await db.jogo.create({
    data: {
      turmaId: turma.id,
      dataJogo: daysFromNow(5),
      status: "CONFIRMACAO_ABERTA",
      limitJogadores: 14,
      observacoes: "Quadra reservada. Levar colete.",
    },
  });

  // 14 confirmados na lista principal
  const confirmados4 = ativos.slice(0, 14);
  // 2 na fila de espera
  const fila4 = ativos.slice(14, 16);
  // 1 recusado
  const recusados4 = [ativos[16]!];

  await db.presenca.createMany({
    data: [
      ...confirmados4.map((j) => ({ jogoId: jogo4.id, jogadorId: j.id, resposta: "SIM" as const, posicaoFila: null, respondeuEm: daysAgo(2) })),
      ...fila4.map((j, i) => ({ jogoId: jogo4.id, jogadorId: j.id, resposta: "SIM" as const, posicaoFila: i + 1, respondeuEm: daysAgo(1) })),
      ...recusados4.map((j) => ({ jogoId: jogo4.id, jogadorId: j.id, resposta: "NAO" as const, respondeuEm: daysAgo(1) })),
    ],
  });

  // ---- Jogo 5: em 2 semanas — RASCUNHO ----
  await db.jogo.create({
    data: {
      turmaId: turma.id,
      dataJogo: daysFromNow(12),
      status: "RASCUNHO",
    },
  });

  console.log("✅ Seed concluído!\n");
  console.log("=".repeat(50));
  console.log("CONTAS DE ACESSO");
  console.log("=".repeat(50));
  console.log("Admin  → admin@rachao.app / senha123");
  console.log("Player → thiago@rachao.app / senha123");
  console.log("Player → gustavo@rachao.app / senha123");
  console.log("Player → rodrigo@rachao.app / senha123");
  console.log("Player → carlos@rachao.app / senha123");
  console.log("Player → rafael@rachao.app / senha123");
  console.log("=".repeat(50));
  console.log(`Turma: ${turma.nome} (${turma.id})`);
  console.log(`Jogadores: ${jogadores.length} (${ativos.length} ativos)`);
  console.log(`Jogos: 3 finalizados + 1 com confirmação aberta + 1 rascunho`);
  console.log(`Pagamentos: 4 meses × ${ativos.length} jogadores`);
  console.log("=".repeat(50));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
