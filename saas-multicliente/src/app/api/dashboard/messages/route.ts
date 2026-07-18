import { NextResponse } from "next/server";
import {
  AuthError,
  requireRole,
  requireSessionFromRequest,
  requireTenantAccess,
} from "@/lib/auth";
import { listMessagesByTenant } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = requireSessionFromRequest(request);
    requireRole(session, ["owner", "editor", "viewer"]);

    const url = new URL(request.url);
    const tenantSlug = String(url.searchParams.get("tenantSlug") || "").trim() || session.tenantSlug;
    requireTenantAccess(session, tenantSlug);

    const items = await listMessagesByTenant(tenantSlug);

    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
