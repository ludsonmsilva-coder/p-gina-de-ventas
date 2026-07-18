-- Seed mínimo de desenvolvimento

insert into "Tenant" ("id", "slug", "name", "status", "createdAt", "updatedAt")
values (
  gen_random_uuid()::text,
  'cliente-demo',
  'Cliente Demo',
  'active',
  now(),
  now()
)
on conflict ("slug") do nothing;

insert into "User" ("id", "email", "name", "createdAt", "updatedAt")
values (
  gen_random_uuid()::text,
  'owner@cliente-demo.com',
  'Owner Cliente Demo',
  now(),
  now()
)
on conflict ("email") do nothing;

insert into "Membership" ("id", "tenantId", "userId", "role", "createdAt")
select
  gen_random_uuid()::text,
  t."id",
  u."id",
  'owner',
  now()
from "Tenant" t
join "User" u on u."email" = 'owner@cliente-demo.com'
where t."slug" = 'cliente-demo'
on conflict ("tenantId", "userId") do nothing;
