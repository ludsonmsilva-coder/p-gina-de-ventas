import type { LandingPage, MessageType, PageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  defaultLandingContent,
  normalizeLandingContent,
  type LandingContent,
} from "@/lib/page-config";

export type { MessageType };

export type ProductMessage = {
  id: string;
  tenantSlug: string;
  pageSlug: string;
  type: MessageType;
  email: string;
  message: string;
  createdAt: string;
};

export type LandingDraft = {
  id: string;
  tenantSlug: string;
  status: PageStatus;
  title: string;
  version: number;
  content: LandingContent;
  updatedAt: string;
};

type SaveMessageInput = {
  tenantSlug: string;
  pageSlug: string;
  type: MessageType;
  email: string;
  message: string;
  createdAt?: string;
};

type SaveLandingDraftInput = {
  tenantSlug: string;
  title: string;
  content: unknown;
};

export async function saveMessage(input: SaveMessageInput): Promise<void> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: input.tenantSlug },
    select: { id: true },
  });

  if (!tenant) {
    throw new Error("Tenant não encontrado");
  }

  await prisma.message.create({
    data: {
      tenantId: tenant.id,
      pageSlug: input.pageSlug,
      type: input.type,
      email: input.email,
      message: input.message,
      createdAt: input.createdAt ? new Date(input.createdAt) : undefined,
    },
  });
}

export async function listMessagesByTenant(tenantSlug: string): Promise<ProductMessage[]> {
  const rows = await prisma.message.findMany({
    where: { tenant: { slug: tenantSlug } },
    orderBy: { createdAt: "desc" },
    include: {
      tenant: { select: { slug: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    tenantSlug: row.tenant.slug,
    pageSlug: row.pageSlug,
    type: row.type,
    email: row.email,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
  }));
}

async function findTenantOrThrow(tenantSlug: string): Promise<{ id: string; slug: string; name: string }> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true, slug: true, name: true },
  });

  if (!tenant) {
    throw new Error("Tenant não encontrado");
  }

  return tenant;
}

function mapLandingPage(row: LandingPage & { tenant: { slug: string } }): LandingDraft {
  return {
    id: row.id,
    tenantSlug: row.tenant.slug,
    status: row.status,
    title: row.title,
    version: row.version,
    content: normalizeLandingContent(row.contentJson),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getLatestLandingDraftByTenant(
  tenantSlug: string,
  status?: PageStatus,
): Promise<LandingDraft | null> {
  const where = status
    ? { tenant: { slug: tenantSlug }, status }
    : { tenant: { slug: tenantSlug } };

  const row = await prisma.landingPage.findFirst({
    where,
    orderBy: [{ updatedAt: "desc" }, { version: "desc" }],
    include: { tenant: { select: { slug: true } } },
  });

  if (!row) return null;
  return mapLandingPage(row);
}

export async function saveLandingDraft(input: SaveLandingDraftInput): Promise<LandingDraft> {
  const tenant = await findTenantOrThrow(input.tenantSlug);
  const content = normalizeLandingContent(input.content);

  const lastVersion = await prisma.landingPage.findFirst({
    where: { tenantId: tenant.id },
    select: { version: true },
    orderBy: { version: "desc" },
  });

  const row = await prisma.landingPage.create({
    data: {
      tenantId: tenant.id,
      title: input.title || content.productName,
      status: "draft",
      version: (lastVersion?.version || 0) + 1,
      contentJson: content,
    },
    include: { tenant: { select: { slug: true } } },
  });

  return mapLandingPage(row);
}

export async function publishLatestLandingByTenant(tenantSlug: string): Promise<LandingDraft> {
  const tenant = await findTenantOrThrow(tenantSlug);

  const draft = await prisma.landingPage.findFirst({
    where: { tenantId: tenant.id, status: "draft" },
    orderBy: [{ updatedAt: "desc" }, { version: "desc" }],
    include: { tenant: { select: { slug: true } } },
  });

  if (!draft) {
    throw new Error("Nenhum draft encontrado para publicar");
  }

  await prisma.landingPage.updateMany({
    where: { tenantId: tenant.id, status: "published" },
    data: { status: "draft" },
  });

  const published = await prisma.landingPage.update({
    where: { id: draft.id },
    data: { status: "published" },
    include: { tenant: { select: { slug: true } } },
  });

  return mapLandingPage(published);
}

export function getDefaultLandingDraft(tenantSlug: string): LandingDraft {
  return {
    id: "default",
    tenantSlug,
    status: "draft",
    title: defaultLandingContent.productName,
    version: 0,
    content: { ...defaultLandingContent, prices: { ...defaultLandingContent.prices } },
    updatedAt: new Date(0).toISOString(),
  };
}
