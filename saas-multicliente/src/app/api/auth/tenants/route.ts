import { NextResponse } from "next/server";
import { AuthError, listMembershipsByUser, requireSessionFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = requireSessionFromRequest(request);
    const tenants = await listMembershipsByUser(session.id);
    return NextResponse.json({ ok: true, tenants }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
