import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export type AppRole = "owner" | "editor" | "viewer";

export type SessionUser = {
  id: string;
  email: string;
  tenantId: string;
  tenantSlug: string;
  role: AppRole;
  exp: number;
};

export type UserTenantMembership = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  role: AppRole;
  canEdit: boolean;
};

type SessionTokenPayload = SessionUser;

export class AuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const AUTH_COOKIE_NAME = "saas_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const AUTH_SECRET = process.env.AUTH_SECRET || "dev-insecure-secret-change-me";

function encodeBase64Url(raw: string): string {
  return Buffer.from(raw, "utf8").toString("base64url");
}

function decodeBase64Url(raw: string): string {
  return Buffer.from(raw, "base64url").toString("utf8");
}

function sign(input: string): string {
  return createHmac("sha256", AUTH_SECRET).update(input).digest("base64url");
}

function getCookieValue(cookieHeader: string | null, key: string): string | null {
  if (!cookieHeader) return null;

  const pairs = cookieHeader.split(";").map((part) => part.trim());
  for (const pair of pairs) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (name === key) return value;
  }

  return null;
}

export function createSessionToken(input: Omit<SessionUser, "exp">): string {
  const payload: SessionTokenPayload = {
    ...input,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payloadEncoded = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export function parseSessionToken(token: string): SessionUser | null {
  try {
    const [payloadEncoded, providedSignature] = token.split(".");
    if (!payloadEncoded || !providedSignature) return null;

    const expectedSignature = sign(payloadEncoded);
    const same =
      expectedSignature.length === providedSignature.length &&
      timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature));
    if (!same) return null;

    const payload = JSON.parse(decodeBase64Url(payloadEncoded)) as SessionTokenPayload;
    if (!payload?.id || !payload?.email || !payload?.tenantId || !payload?.tenantSlug || !payload?.role) {
      return null;
    }
    if (typeof payload.exp !== "number") return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: Request): SessionUser | null {
  const cookieHeader = request.headers.get("cookie");
  const raw = getCookieValue(cookieHeader, AUTH_COOKIE_NAME);
  if (!raw) return null;
  return parseSessionToken(raw);
}

export function requireSessionFromRequest(request: Request): SessionUser {
  const session = getSessionFromRequest(request);
  if (!session) {
    throw new AuthError(401, "Sessão inválida ou expirada");
  }
  return session;
}

export function requireRole(session: SessionUser, allowed: AppRole[]): void {
  if (!allowed.includes(session.role)) {
    throw new AuthError(403, "Sem permissão para esta ação");
  }
}

export function requireTenantAccess(session: SessionUser, tenantSlug: string): void {
  if (session.tenantSlug !== tenantSlug) {
    throw new AuthError(403, "Acesso negado para este tenant");
  }
}

function membershipToSession(input: {
  userId: string;
  email: string;
  tenantId: string;
  tenantSlug: string;
  role: AppRole;
}): SessionUser {
  return {
    id: input.userId,
    email: input.email,
    tenantId: input.tenantId,
    tenantSlug: input.tenantSlug,
    role: input.role,
    exp: 0,
  };
}

export async function authenticateMembership(email: string, tenantSlug: string): Promise<SessionUser> {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedSlug = String(tenantSlug || "").trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new AuthError(400, "Email inválido");
  }
  if (!normalizedSlug) {
    throw new AuthError(400, "tenantSlug é obrigatório");
  }

  const membership = await prisma.membership.findFirst({
    where: {
      user: { email: normalizedEmail },
      tenant: { slug: normalizedSlug, status: "active" },
    },
    include: {
      user: { select: { id: true, email: true } },
      tenant: { select: { id: true, slug: true } },
    },
  });

  if (!membership) {
    throw new AuthError(401, "Usuário sem acesso a este tenant");
  }

  return membershipToSession({
    userId: membership.user.id,
    email: membership.user.email,
    tenantId: membership.tenant.id,
    tenantSlug: membership.tenant.slug,
    role: membership.role,
  });
}

export async function listMembershipsByUser(userId: string): Promise<UserTenantMembership[]> {
  const memberships = await prisma.membership.findMany({
    where: {
      userId,
      tenant: { status: "active" },
    },
    orderBy: { createdAt: "asc" },
    include: {
      tenant: { select: { id: true, slug: true, name: true } },
    },
  });

  return memberships.map((membership) => ({
    tenantId: membership.tenant.id,
    tenantSlug: membership.tenant.slug,
    tenantName: membership.tenant.name,
    role: membership.role,
    canEdit: canEdit(membership.role),
  }));
}

export async function switchSessionTenant(session: SessionUser, tenantSlug: string): Promise<SessionUser> {
  const normalizedSlug = String(tenantSlug || "").trim().toLowerCase();
  if (!normalizedSlug) {
    throw new AuthError(400, "tenantSlug é obrigatório");
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.id,
      tenant: { slug: normalizedSlug, status: "active" },
    },
    include: {
      tenant: { select: { id: true, slug: true } },
    },
  });

  if (!membership) {
    throw new AuthError(403, "Você não tem acesso a este tenant");
  }

  return membershipToSession({
    userId: session.id,
    email: session.email,
    tenantId: membership.tenant.id,
    tenantSlug: membership.tenant.slug,
    role: membership.role,
  });
}

export function canEdit(role: AppRole): boolean {
  return role === "owner" || role === "editor";
}
