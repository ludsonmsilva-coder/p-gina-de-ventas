import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AuthError,
  authenticateMembership,
  canEdit,
  createSessionToken,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const email = String(payload.email || "").trim().toLowerCase();
    const tenantSlug = String(payload.tenantSlug || "").trim().toLowerCase();

    const session = await authenticateMembership(email, tenantSlug);
    const token = createSessionToken(session);

    const response = NextResponse.json(
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
