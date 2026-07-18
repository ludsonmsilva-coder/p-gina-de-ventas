# Rotas de API do MVP

## 1) Público - Envio de mensagem
POST /api/public/message

Body:
{
  "tenantSlug": "cliente-demo",
  "pageSlug": "home",
  "type": "pergunta",
  "email": "cliente@email.com",
  "message": "Texto da mensagem"
}

Validações:
- type obrigatório: pergunta | sugestao | reclamacao
- email obrigatório e válido
- message obrigatório com 1 a 500 caracteres

Resposta 201:
{
  "ok": true,
  "messageId": "uuid"
}

## 2) Dashboard - Listar mensagens
GET /api/dashboard/messages?tenantId=...&page=1&pageSize=20

Autorização:
- Requer sessão
- Role owner, editor ou viewer
- Tenant da sessão deve bater com tenant da consulta

Resposta 200:
{
  "items": [
    {
      "id": "uuid",
      "type": "pergunta",
      "email": "cliente@email.com",
      "message": "...",
      "createdAt": "2026-07-18T14:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20
}

## 3) Dashboard - Salvar draft da landing
POST /api/dashboard/page-config

Body:
{
  "tenantId": "uuid",
  "content": { "...": "json da página" }
}

Resposta 200:
{
  "ok": true,
  "version": 12,
  "status": "draft"
}

## 4) Dashboard - Publicar landing
POST /api/dashboard/page-publish

Body:
{
  "tenantId": "uuid"
}

Resposta 200:
{
  "ok": true,
  "version": 13,
  "status": "published"
}

## Regras de segurança
- Não aceitar tenantId cego do cliente sem validar sessão.
- Sempre resolver tenant pelo host + sessão.
- Sanitizar e validar payload no servidor.
- Limite de rate para rota pública de mensagem.
