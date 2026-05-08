# Checklist de teste real do MVP

## Antes do disparo

- confirmar `DATABASE_URL` apontando para ambiente certo
- confirmar `WHATSAPP_DELIVERY_MODE=dry-run` no primeiro ensaio
- confirmar `ENABLE_WEEKLY_JOBS=0` durante carga inicial
- validar `whatsappGroupId` da turma
- validar `whatsappProvider` da turma
- subir 30 jogadores por CSV
- revisar 5 telefones manualmente
- revisar horarios da turma e cron jobs

## Carga inicial de 30 jogadores

1. preparar CSV no formato de [jogadores-template.csv](C:/Users/joão.benedito/OneDrive%20-%20GENIALNET%20GEST%C3%83O%20E%20TECNOLOGIA%20LTDA%20-%20EPP/Documentos/Rachao/docs/jogadores-template.csv)
2. rodar dry-run
3. revisar preview
4. rodar importacao em `production`
5. validar contagem em `GET /api/jogadores?turmaId=...`

## Virada para teste real

1. rodar confirmacao manual com `WHATSAPP_DELIVERY_MODE=dry-run`
2. revisar logs
3. trocar para `WHATSAPP_DELIVERY_MODE=production`
4. disparar confirmacao manual para turma piloto
5. acompanhar respostas por 30 minutos

## Depois do disparo

- conferir `GET /api/logs`
- conferir `GET /api/dashboard`
- conferir presencas no dashboard
- conferir ranking de presenca
- manter `ENABLE_WEEKLY_JOBS=0` ate validar fluxo manual

