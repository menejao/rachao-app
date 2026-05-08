# Guia de conexao WhatsApp e teste real

## Modos

- `WHATSAPP_DELIVERY_MODE=dry-run`
  - nao envia mensagem real
  - registra logs e payloads
  - usar primeiro
- `WHATSAPP_DELIVERY_MODE=production`
  - prepara envio real pelo provider configurado
  - usar so apos checklist

## Variaveis principais

- `WHATSAPP_PROVIDER`
- `WHATSAPP_DELIVERY_MODE`
- `EVOLUTION_API_URL`
- `EVOLUTION_API_KEY`
- `ZAPI_INSTANCE_ID`
- `ZAPI_TOKEN`

## Conectar Evolution API

1. subir instancia da Evolution
2. copiar URL base para `EVOLUTION_API_URL`
3. copiar token para `EVOLUTION_API_KEY`
4. configurar webhook apontando para:
   - `POST /api/webhooks/whatsapp`
5. validar recebimento com payload de teste

## Conectar Z-API

1. criar instancia na Z-API
2. copiar `instance id`
3. copiar token
4. configurar webhook para:
   - `POST /api/webhooks/whatsapp`
5. validar recebimento com payload de teste

## Mensagens reais do bot

- confirmacao de presenca
- lembrete para pendentes
- lista fechada
- times gerados

## Teste recomendado

1. `dry-run`
2. confirmacao manual
3. revisar logs
4. ativar `production`
5. enviar para turma piloto
6. confirmar 3 respostas reais
7. fechar lista manual
8. gerar times manual

