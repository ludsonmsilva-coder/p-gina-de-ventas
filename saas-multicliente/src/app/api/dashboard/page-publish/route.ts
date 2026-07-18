import { NextResponse } from "next/server";
import {
  AuthError,
  requireRole,
  requireSessionFromRequest,
  requireTenantAccess,
} from "@/lib/auth";
import { publishLatestLandingByTenant } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = requireSessionFromRequest(request);
    requireRole(session, ["owner", "editor"]);

    const payload = (await request.json()) as Record<string, unknown>;
    const tenantSlug = String(payload.tenantSlug || "").trim() || session.tenantSlug;
    requireTenantAccess(session, tenantSlug);

    const item = await publishLatestLandingByTenant(tenantSlug);
    return NextResponse.json({ ok: true, item, status: "published" }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
