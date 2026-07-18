import { NextResponse } from "next/server";
import { canEdit, getSessionFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
  }

  return NextResponse.json(
    {
      ok: true,
      session: {
        email: session.email,
        tenantSlug: session.tenantSlug,
        role: session.role,
        canEdit: canEdit(session.role),
      },
    },
    { status: 200 },
  );
}
