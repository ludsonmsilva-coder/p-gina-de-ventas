-- Schema SQL inicial para MVP multi-tenant
-- Compatível com Postgres

create extension if not exists pgcrypto;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('owner','editor','viewer')),
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table if not exists landing_pages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  status text not null check (status in ('draft','published')),
  version int not null,
  content_json jsonb not null,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_landing_pages_tenant_status
  on landing_pages (tenant_id, status, updated_at desc);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  page_slug text not null,
  type text not null check (type in ('pergunta','sugestao','reclamacao')),
  email text not null,
  message text not null,
  source_ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_tenant_created_at
  on messages (tenant_id, created_at desc);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  kind text not null,
  url text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_assets_tenant_kind
  on assets (tenant_id, kind);

-- Exemplo de seed mínimo
insert into tenants (slug, name)
values ('cliente-demo', 'Cliente Demo')
on conflict (slug) do nothing;
