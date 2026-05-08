# WhatsApp MVP

## Escopo

Fluxo atual cobre:

- disparo manual de confirmação
- webhook de entrada
- parser de respostas curtas
- persistência em `Presenca`
- logs em `EventoLog`
- mocks para validar sem provedor real

## Endpoints

### Disparar confirmação

`POST /api/presencas/disparar`

Body:

```json
{
  "turmaId": "clx123",
  "dataJogo": "2026-05-14"
}
```

Resposta:

```json
{
  "ok": true,
  "jogoId": "cm123",
  "provider": "mock",
  "providerMessageId": "mock-1710000000000",
  "playerCount": 12,
  "mocked": true
}
```

### Webhook de mensagem

`POST /api/webhooks/whatsapp`

Body normalizado:

```json
{
  "provider": "evolution",
  "groupId": "1203630@g.us",
  "fromPhone": "5511999991234",
  "message": "sim"
}
```

Respostas aceitas:

- `1`
- `sim`
- `vou`
- `confirmo`
- `2`
- `não`
- `nao`

### Mock sem WhatsApp real

`POST /api/mocks/whatsapp`

Mesmo body do webhook. Provider sempre tratado como `mock`.

## Configuração por turma

Para disparo funcionar, turma precisa ter:

- `whatsappGroupId`
- `whatsappProvider`: `mock`, `evolution` ou `zapi`

## Evolution API

Configurar depois no adapter real:

1. Subir instância Evolution API.
2. Conectar sessão WhatsApp.
3. Apontar webhook de mensagens para `POST /api/webhooks/whatsapp`.
4. Mapear payload do provedor para formato normalizado:
   - `provider`
   - `groupId`
   - `fromPhone`
   - `message`

## Z-API

Configurar depois no adapter real:

1. Criar instância Z-API.
2. Conectar número.
3. Configurar webhook para `POST /api/webhooks/whatsapp`.
4. Traduzir payload original para mesmo contrato interno normalizado.

## Logs

Consultar logs em `GET /api/logs`.

Eventos principais:

- `presence.dispatch`
- `presence.webhook.received`
- `presence.webhook.unmatched`
- `presence.response.saved`
- `teams.generated`
- `teams.regenerated.command`

## Sorteio manual e comando

### Endpoint manual

`POST /api/times/gerar`

```json
{
  "jogoId": "cm123",
  "teamCount": 2
}
```

### Comando no grupo

Se webhook receber mensagem `/times`, sistema refaz sorteio usando jogadores confirmados (`Presenca.resposta = SIM`) e atualiza:

- tabela `Time`
- campo `Presenca.timeId`

## Fluxo de teste local

1. Criar turma com `whatsappProvider = "mock"` e `whatsappGroupId`.
2. Criar jogadores com telefone.
3. Chamar `POST /api/presencas/disparar`.
4. Simular resposta via `POST /api/mocks/whatsapp`.
5. Verificar `Presenca` e `GET /api/logs`.
