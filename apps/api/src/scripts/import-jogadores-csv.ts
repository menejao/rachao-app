import { prisma } from "../core/prisma";
import { normalizePhone } from "@rachao/utils";
import type { Posicao } from "@rachao/types";
import { readFile } from "node:fs/promises";

interface CsvRow {
  nome: string;
  telefone: string;
  email?: string;
  posicao: Posicao;
  nivel: number;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = args.file;
  const turmaId = args.turmaId;
  const mode = args.mode ?? "dry-run";

  if (!file || !turmaId) {
    throw new Error("Uso: tsx apps/api/src/scripts/import-jogadores-csv.ts --file caminho.csv --turmaId TURMA --mode dry-run|production");
  }

  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    select: { id: true, nome: true },
  });

  if (!turma) {
    throw new Error("Turma nao encontrada");
  }

  const rows = parseCsv(await readFile(file, "utf8"));
  validateRows(rows);

  const preview = rows.slice(0, 5).map((row) => `${row.nome} | ${row.telefone} | ${row.posicao} | ${row.nivel}`);
  console.log(`Turma: ${turma.nome}`);
  console.log(`Jogadores no arquivo: ${rows.length}`);
  console.log(`Modo: ${mode}`);
  console.log("Preview:");
  preview.forEach((line) => console.log(`- ${line}`));

  if (mode !== "production") {
    console.log("Dry-run concluido. Nada foi gravado.");
    return;
  }

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const existing = await prisma.jogador.findUnique({
      where: { telefone: normalizePhone(row.telefone) },
      select: { id: true },
    });

    await prisma.jogador.upsert({
      where: { telefone: normalizePhone(row.telefone) },
      create: {
        turmaId,
        nome: row.nome,
        telefone: normalizePhone(row.telefone),
        email: row.email || null,
        posicao: row.posicao,
        nivel: row.nivel,
        ativo: true,
      },
      update: {
        turmaId,
        nome: row.nome,
        email: row.email || null,
        posicao: row.posicao,
        nivel: row.nivel,
        ativo: true,
      },
    });

    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log(`Importacao concluida. Criados: ${created}. Atualizados: ${updated}.`);
}

function parseArgs(args: string[]) {
  const output: Record<string, string> = {};

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    const next = args[index + 1];
    if (!current?.startsWith("--") || !next) {
      continue;
    }
    output[current.slice(2)] = next;
    index += 1;
  }

  return output;
}

function parseCsv(content: string): CsvRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0] ?? "").map((item) => item.toLowerCase());

  return lines.slice(1).map((line, lineIndex) => {
    const cols = splitCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, cols[index] ?? ""])) as Record<string, string>;

    return {
      nome: row.nome?.trim(),
      telefone: row.telefone?.trim(),
      email: row.email?.trim() || undefined,
      posicao: normalizePosicao(row.posicao?.trim(), lineIndex + 2),
      nivel: Number(row.nivel),
    };
  });
}

function splitCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let quoted = false;

  for (const char of line) {
    if (char === "\"") {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  result.push(current);
  return result;
}

function normalizePosicao(value: string, lineNumber: number): Posicao {
  const upper = value.toUpperCase();
  if (upper === "GOLEIRO" || upper === "FIXO" || upper === "ALA" || upper === "PIVO" || upper === "CORINGA") {
    return upper;
  }
  throw new Error(`Posicao invalida na linha ${lineNumber}: ${value}`);
}

function validateRows(rows: CsvRow[]) {
  if (rows.length === 0) {
    throw new Error("CSV vazio ou sem linhas validas");
  }

  const phones = new Set<string>();
  rows.forEach((row, index) => {
    if (!row.nome || !row.telefone || !Number.isFinite(row.nivel)) {
      throw new Error(`Linha invalida no CSV: ${index + 2}`);
    }
    const phone = normalizePhone(row.telefone);
    if (phones.has(phone)) {
      throw new Error(`Telefone duplicado no CSV: ${row.telefone}`);
    }
    phones.add(phone);
  });
}

void main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
