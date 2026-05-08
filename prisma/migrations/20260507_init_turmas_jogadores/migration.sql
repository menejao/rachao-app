-- CreateEnum
CREATE TYPE "TurmaStatus" AS ENUM ('ATIVA', 'INATIVA');

-- CreateEnum
CREATE TYPE "Posicao" AS ENUM ('GOLEIRO', 'FIXO', 'ALA', 'PIVO', 'CORINGA');

-- CreateEnum
CREATE TYPE "JogoStatus" AS ENUM ('RASCUNHO', 'CONFIRMACAO_ABERTA', 'FECHADO', 'TIMES_GERADOS', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "RespostaPresenca" AS ENUM ('SIM', 'NAO', 'PENDENTE');

-- CreateEnum
CREATE TYPE "PagamentoStatus" AS ENUM ('PENDENTE', 'PAGO', 'ATRASADO', 'ISENTO');

CREATE TABLE "Organizador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Organizador_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Turma" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "local" TEXT,
    "diaSemana" INTEGER NOT NULL,
    "horario" TEXT NOT NULL,
    "mensalidade" DECIMAL(10,2) NOT NULL,
    "status" "TurmaStatus" NOT NULL DEFAULT 'ATIVA',
    "organizadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Jogador" (
    "id" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "posicao" "Posicao" NOT NULL,
    "nivel" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Jogador_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Jogo" (
    "id" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "dataJogo" TIMESTAMP(3) NOT NULL,
    "status" "JogoStatus" NOT NULL DEFAULT 'RASCUNHO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Jogo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Time" (
    "id" TEXT NOT NULL,
    "jogoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT,
    "nivelMedio" DECIMAL(4,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Time_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Presenca" (
    "id" TEXT NOT NULL,
    "jogoId" TEXT NOT NULL,
    "jogadorId" TEXT NOT NULL,
    "timeId" TEXT,
    "resposta" "RespostaPresenca" NOT NULL DEFAULT 'PENDENTE',
    "respondeuEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Presenca_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "jogadorId" TEXT NOT NULL,
    "referenciaMes" INTEGER NOT NULL,
    "referenciaAno" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "PagamentoStatus" NOT NULL DEFAULT 'PENDENTE',
    "pagoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Gol" (
    "id" TEXT NOT NULL,
    "jogoId" TEXT NOT NULL,
    "jogadorId" TEXT NOT NULL,
    "assistenciaId" TEXT,
    "minuto" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Gol_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Organizador_email_key" ON "Organizador"("email");
CREATE UNIQUE INDEX "Jogador_telefone_key" ON "Jogador"("telefone");
CREATE INDEX "Jogador_turmaId_idx" ON "Jogador"("turmaId");
CREATE INDEX "Jogo_turmaId_dataJogo_idx" ON "Jogo"("turmaId", "dataJogo");
CREATE INDEX "Time_jogoId_idx" ON "Time"("jogoId");
CREATE UNIQUE INDEX "Presenca_jogoId_jogadorId_key" ON "Presenca"("jogoId", "jogadorId");
CREATE INDEX "Presenca_jogoId_idx" ON "Presenca"("jogoId");
CREATE INDEX "Presenca_jogadorId_idx" ON "Presenca"("jogadorId");
CREATE UNIQUE INDEX "Pagamento_jogadorId_referenciaMes_referenciaAno_key" ON "Pagamento"("jogadorId", "referenciaMes", "referenciaAno");
CREATE INDEX "Pagamento_turmaId_referenciaAno_referenciaMes_idx" ON "Pagamento"("turmaId", "referenciaAno", "referenciaMes");
CREATE INDEX "Gol_jogoId_idx" ON "Gol"("jogoId");
CREATE INDEX "Gol_jogadorId_idx" ON "Gol"("jogadorId");

ALTER TABLE "Turma" ADD CONSTRAINT "Turma_organizadorId_fkey" FOREIGN KEY ("organizadorId") REFERENCES "Organizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Jogador" ADD CONSTRAINT "Jogador_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Jogo" ADD CONSTRAINT "Jogo_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Time" ADD CONSTRAINT "Time_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "Jogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "Jogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Jogador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Jogador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Gol" ADD CONSTRAINT "Gol_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "Jogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Gol" ADD CONSTRAINT "Gol_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Jogador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Gol" ADD CONSTRAINT "Gol_assistenciaId_fkey" FOREIGN KEY ("assistenciaId") REFERENCES "Jogador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
