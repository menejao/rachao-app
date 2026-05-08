# AGENTS.md

## Objetivo do projeto

Rachão é SaaS para gestão de peladas recorrentes.
MVP deve priorizar operação real de turma fixa com WhatsApp como interface principal.

## Regras de produto

- Não criar app mobile.
- Não construir features V2/V3 antes de fluxo semanal MVP funcionar.
- Prioridade máxima:
  - cadastro de turmas
  - cadastro de jogadores
  - confirmação via WhatsApp
  - registro de respostas
  - divisão automática de times
  - financeiro básico
  - dashboard simples
- Estatísticas de gols entram primeiro como base estrutural, não como módulo completo.

## Regras de arquitetura

- Manter monorepo com `apps/web`, `apps/api`, `packages/types`, `packages/utils`.
- Frontend: Next.js + TypeScript + TailwindCSS + shadcn/ui.
- Backend: Node.js + TypeScript.
- Banco: PostgreSQL/Supabase com Prisma.
- Validação de entrada: Zod.
- Compartilhar contratos em `packages/types`.
- Funções puras e regras reutilizáveis em `packages/utils`.
- Evitar lógica de negócio no frontend.
- Evitar acoplamento direto ao provedor WhatsApp. Sempre usar camada adaptadora.

## Regras de implementação

- Não implementar tudo de uma vez.
- Trabalhar em fatias pequenas, testáveis e demonstráveis.
- Cada tarefa nova deve informar:
  - objetivo
  - arquivos alterados
  - como validar
- Sempre documentar decisões técnicas relevantes em `docs/`.
- Quando criar endpoint, incluir exemplo de request/response.
- Quando criar regra de negócio, adicionar ao menos teste unitário se lógica tiver risco real.
- Quando não houver teste automatizado ainda, descrever validação manual exata.

## Sequência padrão para futuras tasks

1. Modelar contrato ou entidade.
2. Implementar caso de uso no backend.
3. Expor endpoint ou job.
4. Conectar UI mínima.
5. Validar manualmente ou com teste.
6. Documentar decisão.

## Anti-patterns

- Não usar app mobile ou React Native agora.
- Não criar microserviços.
- Não introduzir filas, event bus ou CQRS sem dor real.
- Não acoplar schema do banco ao payload cru do provedor WhatsApp.
- Não criar dashboard complexo antes de bot funcionar.
- Não estilizar demais antes de fluxo principal existir.

## Definição de pronto

Mudança só está pronta quando:

- compila
- tem caminho claro de validação
- documentação mínima foi atualizada
- mantém foco no MVP
