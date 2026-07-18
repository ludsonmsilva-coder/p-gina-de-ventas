# SaaS Multi-Cliente (Base MVP)

Base técnica para transformar a landing em um produto multi-tenant na Vercel.

## Pré-requisitos

- Node.js 20+
- Banco Postgres (Supabase, Neon, etc.)

## Setup local

1. Copie `.env.example` para `.env`.
2. Configure `DATABASE_URL`.
3. Gere o client Prisma:

```bash
npm run prisma:generate
```

4. Rode migrations:

```bash
npm run prisma:migrate:dev -- --name init
```

5. Rode o app:

```bash
npm run dev
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run prisma:generate`
- `npm run prisma:migrate:dev`
- `npm run prisma:studio`

## Estrutura principal

- `src/app/(public)/[slug]/page.tsx`: landing pública por tenant.
- `src/app/(dashboard)/dashboard/page.tsx`: painel do produtor.
- `src/app/(dashboard)/dashboard/messages/page.tsx`: inbox de mensagens.
- `src/app/api/public/message/route.ts`: endpoint público de mensagens.
- `src/app/api/dashboard/messages/route.ts`: listagem de mensagens por tenant.
- `prisma/schema.prisma`: modelo de dados multi-tenant.

## Observações

- O código de auth ainda está como placeholder em `src/lib/auth.ts`.
- As rotas de dashboard precisam de proteção por sessão/tenant na próxima fase.
