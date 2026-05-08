# Plano técnico em fases pequenas

## Fase 0 - Base

- estruturar monorepo
- definir schema inicial Prisma
- documentar arquitetura
- configurar contratos compartilhados
- validação:
  - `npm install`
  - `npm run typecheck`

## Fase 1 - Core de turma e jogadores

- CRUD de turmas
- CRUD de jogadores
- seed inicial opcional
- validação:
  - criar turma
  - cadastrar 3 jogadores
  - listar no painel

## Fase 2 - Confirmação via WhatsApp

- adapter Evolution/Z-API
- endpoint webhook
- job semanal de disparo
- persistência de respostas
- validação:
  - simular payload de webhook
  - verificar presença gravada

## Fase 3 - Geração de times

- algoritmo inicial por posição + nível
- fechamento de lista
- endpoint/manual action para gerar times
- validação:
  - massa de teste com jogadores
  - conferir equilíbrio básico

## Fase 4 - Financeiro básico

- mensalidade por turma
- status pago/pendente
- visão simples no dashboard
- lembrete manual ou automático
- validação:
  - marcar pagamento
  - listar inadimplentes

## Fase 5 - Base de estatísticas

- modelagem de partidas e gols
- sem UX completa ainda
- preparar base para ranking futuro
- validação:
  - registrar gol manualmente
  - consultar total por jogador

## Fase 6 - Hardening MVP

- auth mínima
- logs essenciais
- tratamento de erro
- testes de regras críticas
- checklist deploy Vercel + Railway/Render
