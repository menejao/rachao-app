# Plano de rollback

## Quando acionar

- mensagens foram para grupo errado
- webhook entrou quebrado
- importacao CSV trouxe telefones errados
- jobs automaticos dispararam em horario errado

## Acoes imediatas

1. setar `ENABLE_WEEKLY_JOBS=0`
2. setar `WHATSAPP_DELIVERY_MODE=dry-run`
3. reiniciar API
4. parar novos disparos manuais

## Rollback por frente

### Jobs

- desabilitar jobs
- rodar apenas endpoints manuais

### Mensagens

- voltar provider para `mock`
- manter `dry-run`

### Jogadores

- revisar CSV original
- corrigir dados via nova importacao
- se preciso, restaurar backup do banco

### Presencas

- manter logs
- reabrir jogo manualmente e redisparar confirmacao

## Recuperacao

1. corrigir causa raiz
2. validar em `dry-run`
3. testar com 2 ou 3 numeros internos
4. reativar `production`

