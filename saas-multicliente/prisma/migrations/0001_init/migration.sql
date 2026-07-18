-- Migration inicial de referência para ambiente Postgres
-- Em ambiente real, gere e aplique via `npm run prisma:migrate:dev`

create extension if not exists pgcrypto;

create table if not exists "Tenant" (
  "id" text primary key,
  "slug" text not null unique,
  "name" text not null,
  "status" text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "User" (
  "id" text primary key,
  "email" text not null unique,
  "name" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "Membership" (
  "id" text primary key,
  "tenantId" text not null,
  "userId" text not null,
  "role" text not null,
  "createdAt" timestamptz not null default now(),
  constraint "Membership_tenantId_fkey" foreign key ("tenantId") references "Tenant"("id") on delete cascade,
  constraint "Membership_userId_fkey" foreign key ("userId") references "User"("id") on delete cascade,
  unique ("tenantId", "userId")
);

create table if not exists "LandingPage" (
  "id" text primary key,
  "tenantId" text not null,
  "title" text not null,
  "status" text not null,
  "version" integer not null,
  "contentJson" jsonb not null,
  "createdById" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "LandingPage_tenantId_fkey" foreign key ("tenantId") references "Tenant"("id") on delete cascade,
  constraint "LandingPage_createdById_fkey" foreign key ("createdById") references "User"("id") on delete set null
);

create table if not exists "Message" (
  "id" text primary key,
  "tenantId" text not null,
  "pageSlug" text not null,
  "type" text not null,
  "email" text not null,
  "message" text not null,
  "sourceIp" text,
  "userAgent" text,
  "createdAt" timestamptz not null default now(),
  constraint "Message_tenantId_fkey" foreign key ("tenantId") references "Tenant"("id") on delete cascade
);

create table if not exists "Asset" (
  "id" text primary key,
  "tenantId" text not null,
  "kind" text not null,
  "url" text not null,
  "metadata" jsonb not null,
  "createdAt" timestamptz not null default now(),
  constraint "Asset_tenantId_fkey" foreign key ("tenantId") references "Tenant"("id") on delete cascade
);

create index if not exists "Membership_tenantId_role_idx" on "Membership"("tenantId", "role");
create index if not exists "LandingPage_tenantId_status_updatedAt_idx" on "LandingPage"("tenantId", "status", "updatedAt");
create index if not exists "Message_tenantId_createdAt_idx" on "Message"("tenantId", "createdAt");
create index if not exists "Asset_tenantId_kind_idx" on "Asset"("tenantId", "kind");
