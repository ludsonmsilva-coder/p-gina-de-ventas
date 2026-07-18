import { NextResponse } from "next/server";
import { saveMessage } from "@/lib/db";
import { validatePublicMessage } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = validatePublicMessage(payload);

    await saveMessage({
      tenantSlug: input.tenantSlug,
      pageSlug: input.pageSlug,
      type: input.type,
      email: input.email,
      message: input.message,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
