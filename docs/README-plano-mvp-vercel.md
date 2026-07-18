# Blueprint MVP Multi-Cliente na Vercel

## Objetivo
Transformar a página atual em uma plataforma multi-cliente com:
- Landing page pública por cliente.
- Painel do produtor para editar e publicar.
- Inbox de mensagens de clientes (Pergunta, Sugestão, Reclamação).
- Controle de acesso por tenant.

## Stack recomendada
- Frontend + backend: Next.js 15 (App Router) + TypeScript.
- Banco: Postgres (Supabase ou Neon).
- ORM: Prisma.
- Auth: Auth.js ou Clerk.
- Storage de imagens: Vercel Blob ou Cloudinary.
- Deploy: Vercel (1 projeto, multi-tenant).

## Fases (7 dias)

### Dia 1 - Base
- Criar app Next.js com TypeScript.
- Configurar ESLint e variáveis de ambiente.
- Subir ambiente de staging na Vercel.

### Dia 2 - Banco
- Criar schema multi-tenant.
- Rodar migrations.
- Seed com 1 tenant e 1 usuário owner.

### Dia 3 - Auth e autorização
- Login/logout.
- Roles: owner, editor, viewer.
- Middleware para identificar tenant por host e proteger rotas.

### Dia 4 - Editor
- Salvar configurações da landing no banco.
- Draft e published.
- Publicar versão ativa.

### Dia 5 - Mensagens
- Formulário público com limite de 500 caracteres.
- Inbox por tenant no painel.
- Filtro por tipo e data.

### Dia 6 - Domínios
- Subdomínios por tenant (cliente.seudominio.com).
- Opcional: domínio próprio.
- Resolver tenant por host.

### Dia 7 - Go-live
- Logs e monitoramento.
- Backup do banco.
- Checklist final de segurança e qualidade.

## Estrutura de pastas sugerida

- src/
- src/app/
- src/app/(public)/
- src/app/(public)/[slug]/page.tsx
- src/app/(dashboard)/
- src/app/(dashboard)/dashboard/page.tsx
- src/app/(dashboard)/dashboard/messages/page.tsx
- src/app/api/
- src/app/api/public/message/route.ts
- src/app/api/dashboard/page-config/route.ts
- src/lib/
- src/lib/auth.ts
- src/lib/tenant.ts
- src/lib/db.ts
- src/lib/validation.ts
- src/components/
- src/components/editor/
- src/components/messages/
- prisma/
- prisma/schema.prisma
- docs/

## Regras obrigatórias de multi-tenant
- Toda tabela de domínio deve ter tenant_id.
- Toda consulta protegida deve filtrar por tenant_id no servidor.
- Nunca confiar em tenant_id vindo do cliente.
- Resolver tenant pelo host e sessão.

## Fluxo de publicação
1. Editor altera conteúdo no painel.
2. Sistema salva como draft.
3. Clique em Publicar gera versão published.
4. Página pública usa sempre published.

## Fluxo de mensagem
1. Visitante abre landing pública.
2. Seleciona tipo: Pergunta, Sugestão ou Reclamação.
3. Informa email e mensagem até 500 caracteres.
4. API valida e grava no tenant correto.
5. Painel do produtor mostra inbox por tenant.

## Critérios de pronto
- Login e roles funcionando.
- Isolamento total por tenant validado.
- Publicação draft/published funcionando.
- Formulário e inbox funcionando.
- Deploy estável na Vercel.
