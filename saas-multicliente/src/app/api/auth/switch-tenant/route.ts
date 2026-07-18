import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AuthError,
  canEdit,
  createSessionToken,
  requireSessionFromRequest,
  switchSessionTenant,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = requireSessionFromRequest(request);
    const payload = (await request.json()) as Record<string, unknown>;
    const tenantSlug = String(payload.tenantSlug || "").trim().toLowerCase();

    const nextSession = await switchSessionTenant(session, tenantSlug);
    const token = createSessionToken(nextSession);

    const response = NextResponse.json(
      {
        ok: true,
        session: {
          email: nextSession.email,
          tenantSlug: nextSession.tenantSlug,
          role: nextSession.role,
          canEdit: canEdit(nextSession.role),
        },
      },
      { status: 200 },
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
