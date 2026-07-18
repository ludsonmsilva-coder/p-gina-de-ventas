import { NextResponse } from "next/server";
import {
  AuthError,
  requireRole,
  requireSessionFromRequest,
  requireTenantAccess,
} from "@/lib/auth";
import {
  getDefaultLandingDraft,
  getLatestLandingDraftByTenant,
  saveLandingDraft,
} from "@/lib/db";
import { normalizeLandingContent } from "@/lib/page-config";

export async function GET(request: Request) {
  try {
    const session = requireSessionFromRequest(request);
    requireRole(session, ["owner", "editor", "viewer"]);

    const url = new URL(request.url);
    const tenantSlugParam = String(url.searchParams.get("tenantSlug") || "").trim();
    const tenantSlug = tenantSlugParam || session.tenantSlug;
    const status = String(url.searchParams.get("status") || "").trim();
    requireTenantAccess(session, tenantSlug);

    const item = await getLatestLandingDraftByTenant(
      tenantSlug,
      status === "draft" || status === "published" ? status : undefined,
    );

    return NextResponse.json({ ok: true, item: item || getDefaultLandingDraft(tenantSlug) }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = requireSessionFromRequest(request);
    requireRole(session, ["owner", "editor"]);

    const payload = (await request.json()) as Record<string, unknown>;
    const tenantSlug = String(payload.tenantSlug || "").trim() || session.tenantSlug;
    const title = String(payload.title || "").trim();
    const content = normalizeLandingContent(payload.content);
    requireTenantAccess(session, tenantSlug);

    const item = await saveLandingDraft({ tenantSlug, title, content });
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
