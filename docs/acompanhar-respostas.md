# Guia para acompanhar respostas

## Endpoints uteis

- `GET /api/dashboard`
- `GET /api/logs?limit=50`
- `GET /api/estatisticas`
- `GET /api/jogadores?turmaId=...`

## O que observar

- `presence.dispatch`
- `presence.webhook.received`
- `presence.response.saved`
- `presence.webhook.unmatched`
- `jobs.execution.success`

## Sinais bons

- `playerCount` bate com total esperado
- respostas `SIM` e `NAO` comecam a entrar
- nenhum volume alto de `presence.webhook.unmatched`
- jogo passa para `FECHADO`
- times sao gerados sem erro

## Sinais ruins

- nenhum webhook recebido apos disparo
- muitos telefones sem match
- respostas entrando no grupo errado
- time generation skipped

## Rotina de monitoramento no dia do teste

1. 5 min apos disparo: checar logs
2. 15 min apos disparo: checar presencas
3. 30 min apos disparo: checar pendentes
4. antes de fechar lista: revisar confirmados

