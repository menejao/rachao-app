import { NextRequest, NextResponse } from "next/server";
import { markPagamentoPago } from "@/lib/store";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pagamento = markPagamentoPago(id);
    return NextResponse.json(pagamento);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
