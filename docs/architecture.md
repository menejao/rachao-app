# Arquitetura MVP

## Visão geral

MVP usa WhatsApp como canal principal e painel web como apoio para organizador.

```text
Jogador -> WhatsApp -> Provedor (Evolution/Z-API) -> apps/api -> Supabase/Postgres
Organizador -> apps/web -> apps/api -> Supabase/Postgres
```

## Responsabilidades

### apps/web

- autenticação futura do organizador
- cadastro de turma e jogadores
- visão de presenças
- visão de financeiro básico
- gatilho manual para gerar times

### apps/api

- webhooks WhatsApp
- validação de payload com Zod
- regras de negócio
- jobs agendados de confirmação e lembrete
- integração com Prisma/Supabase
- adaptadores de provedor WhatsApp

### packages/types

- DTOs
- tipos de domínio compartilhados
- enums de status

### packages/utils

- helpers puros
- algoritmo de divisão de times
- formatadores

## Decisões

- Monorepo para compartilhar tipos sem fricção.
- Prisma sobre Supabase para produtividade e migrações claras.
- Backend separado do Next.js para evitar mistura de webhook, jobs e UI.
- Provider adapter para trocar Evolution/Z-API sem reescrever domínio.

## Limites do MVP

- sem app mobile
- sem múltiplos perfis complexos
- sem estatísticas avançadas agora
- sem integrações Instagram/YouTube agora
