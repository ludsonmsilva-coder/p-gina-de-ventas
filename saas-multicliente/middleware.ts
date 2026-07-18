import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getTenantFromHost(hostname: string): string | null {
  const host = hostname.split(":")[0].toLowerCase();
  if (host === "localhost" || host.startsWith("localhost.")) {
    return null;
  }

  const parts = host.split(".");
  if (parts.length < 3) {
    return null;
  }

  return parts[0] || null;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const tenantSlug = getTenantFromHost(request.nextUrl.hostname);

  if (tenantSlug) {
    response.headers.set("x-tenant-slug", tenantSlug);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
