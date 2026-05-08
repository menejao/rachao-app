ALTER TABLE "Turma" ADD COLUMN "whatsappGroupId" TEXT;
ALTER TABLE "Turma" ADD COLUMN "whatsappProvider" TEXT;

CREATE TABLE "EventoLog" (
    "id" TEXT NOT NULL,
    "turmaId" TEXT,
    "jogoId" TEXT,
    "jogadorId" TEXT,
    "tipo" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventoLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EventoLog_turmaId_createdAt_idx" ON "EventoLog"("turmaId", "createdAt");
CREATE INDEX "EventoLog_jogoId_createdAt_idx" ON "EventoLog"("jogoId", "createdAt");

ALTER TABLE "EventoLog" ADD CONSTRAINT "EventoLog_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EventoLog" ADD CONSTRAINT "EventoLog_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "Jogo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EventoLog" ADD CONSTRAINT "EventoLog_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Jogador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
