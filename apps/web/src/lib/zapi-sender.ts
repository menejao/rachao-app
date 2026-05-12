export async function zapiSendText(phone: string, message: string): Promise<void> {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;

  if (!instanceId || !token) {
    console.warn("[zapi-sender] ZAPI_INSTANCE_ID ou ZAPI_TOKEN não configurados");
    return;
  }

  try {
    const res = await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(clientToken ? { "client-token": clientToken } : {}),
        },
        body: JSON.stringify({ phone, message }),
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (!res.ok) {
      console.error("[zapi-sender] Falha:", res.status, await res.text().catch(() => ""));
    }
  } catch (e) {
    console.error("[zapi-sender] Erro ao enviar:", e);
  }
}
