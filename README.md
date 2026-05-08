# Rachao

SaaS para gestao de peladas recorrentes no Brasil.

Meta atual: MVP enxuto com WhatsApp como interface principal e painel web simples para organizadores.

## Arquitetura MVP

- `apps/web`: Next.js + TypeScript + Tailwind + shadcn/ui
- `apps/api`: Node.js + TypeScript para regras de negocio, webhooks e jobs
- `packages/types`: contratos compartilhados
- `packages/utils`: helpers puros
- `prisma`: schema para PostgreSQL/Supabase

## Principios

- sem app mobile agora
- sem overengineering
- WhatsApp primeiro, dashboard como apoio operacional
- features pequenas e validaveis
- toda implementacao deve vir com forma objetiva de validar

## Fluxo MVP

1. Organizador cria turma.
2. Organizador cadastra jogadores.
3. Job semanal dispara confirmacao via WhatsApp.
4. API recebe respostas e grava presencas.
5. Job fecha lista.
6. Job gera times automaticamente.
7. Painel mostra presenca, financeiro e estatisticas basicas.

## Jobs semanais

- domingo 20h: envio de confirmacao
- terca 18h: lembrete para quem nao respondeu
- quarta 10h: fechar lista
- quarta 10h01: gerar times

Todos configuraveis por variavel de ambiente:

- `ENABLE_WEEKLY_JOBS`
- `JOBS_TICK_MS`
- `CRON_SEND_CONFIRMATION`
- `CRON_REMIND_PENDING`
- `CRON_CLOSE_LIST`
- `CRON_GENERATE_TEAMS`
- `WHATSAPP_DELIVERY_MODE`

Rodar manual em dev:

```bash
curl -X POST http://localhost:4000/api/jobs/run \
  -H "Content-Type: application/json" \
  -d "{\"job\":\"send_confirmation\"}"
```

Jobs geram logs em `EventoLog` com tipos como:

- `jobs.execution.success`
- `jobs.execution.failed`
- `jobs.reminder.sent`
- `jobs.list.closed`

## Importar 30 jogadores por CSV

Dry-run:

```bash
npm run import:players -- --file docs/jogadores-template.csv --turmaId SUA_TURMA --mode dry-run
```

Producao:

```bash
npm run import:players -- --file docs/jogadores-template.csv --turmaId SUA_TURMA --mode production
```

Guias operacionais:

- [docs/mvp-go-live-checklist.md](C:/Users/joão.benedito/OneDrive%20-%20GENIALNET%20GEST%C3%83O%20E%20TECNOLOGIA%20LTDA%20-%20EPP/Documentos/Rachao/docs/mvp-go-live-checklist.md)
- [docs/whatsapp-real-test-guide.md](C:/Users/joão.benedito/OneDrive%20-%20GENIALNET%20GEST%C3%83O%20E%20TECNOLOGIA%20LTDA%20-%20EPP/Documentos/Rachao/docs/whatsapp-real-test-guide.md)
- [docs/acompanhar-respostas.md](C:/Users/joão.benedito/OneDrive%20-%20GENIALNET%20GEST%C3%83O%20E%20TECNOLOGIA%20LTDA%20-%20EPP/Documentos/Rachao/docs/acompanhar-respostas.md)
- [docs/rollback-plan.md](C:/Users/joão.benedito/OneDrive%20-%20GENIALNET%20GEST%C3%83O%20E%20TECNOLOGIA%20LTDA%20-%20EPP/Documentos/Rachao/docs/rollback-plan.md)

## Estrutura

```text
apps/
  api/
  web/
packages/
  types/
  utils/
prisma/
docs/
```

## Rodar localmente

```bash
npm install
npx prisma generate
npm run dev
```
