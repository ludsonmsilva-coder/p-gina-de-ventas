import type { MessageType } from "@/lib/db";

export type PublicMessageInput = {
  tenantSlug: string;
  pageSlug: string;
  type: MessageType;
  email: string;
  message: string;
};

const messageTypes: MessageType[] = ["pergunta", "sugestao", "reclamacao"];

export function validatePublicMessage(input: unknown): PublicMessageInput {
  if (!input || typeof input !== "object") {
    throw new Error("Payload inválido");
  }

  const body = input as Record<string, unknown>;
  const tenantSlug = String(body.tenantSlug || "").trim();
  const pageSlug = String(body.pageSlug || "home").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const message = String(body.message || "").trim();
  const type = String(body.type || "") as MessageType;

  if (!tenantSlug) throw new Error("tenantSlug é obrigatório");
  if (!messageTypes.includes(type)) throw new Error("type inválido");
  if (!email || !email.includes("@")) throw new Error("email inválido");
  if (message.length < 1 || message.length > 500) throw new Error("mensagem deve ter 1 a 500 caracteres");

  return { tenantSlug, pageSlug, type, email, message };
}
