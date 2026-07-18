"use client";

import { useEffect, useState } from "react";
import type { LandingContent } from "@/lib/page-config";

type DashboardItem = {
  tenantSlug: string;
  status: "draft" | "published";
  title: string;
  version: number;
  content: LandingContent;
};

type SessionInfo = {
  email: string;
  tenantSlug: string;
  role: "owner" | "editor" | "viewer";
  canEdit: boolean;
};

type TenantOption = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  role: "owner" | "editor" | "viewer";
  canEdit: boolean;
};

const defaultContent: LandingContent = {
  productName: "Nova",
  headline: "El copiloto de IA que convierte el caos de tu negocio en decisiones claras",
  description: "Nova conecta tus datos y automatiza tareas.",
  ctaText: "Probar gratis",
  showPrices: true,
  prices: { starter: "19", pro: "49", enterprise: "129" },
};

export default function DashboardPage() {
  const [tenantSlug, setTenantSlug] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginTenant, setLoginTenant] = useState("demo");
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [checkingSession, setCheckingSession] = useState(true);
  const [title, setTitle] = useState("Nova");
  const [content, setContent] = useState<LandingContent>(defaultContent);
  const [status, setStatus] = useState("Faça login para editar o tenant autorizado");
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = (await res.json()) as {
          ok: boolean;
          session?: SessionInfo;
          error?: string;
        };

        if (!active) return;

        if (data.ok && data.session) {
          setSession(data.session);
          setTenantSlug(data.session.tenantSlug);
          setLoginTenant(data.session.tenantSlug);
          setStatus(`Sessão ativa: ${data.session.email} (${data.session.role})`);
          await loadTenantOptions();
          await loadDraft(data.session.tenantSlug);
        }
      } catch {
        if (active) setStatus("Faça login para editar o tenant autorizado");
      } finally {
        if (active) setCheckingSession(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function loadTenantOptions() {
    const res = await fetch("/api/auth/tenants", { cache: "no-store" });
    const data = (await res.json()) as {
      ok: boolean;
      tenants?: TenantOption[];
      error?: string;
    };

    if (!data.ok || !data.tenants) {
      setTenants([]);
      return;
    }

    setTenants(data.tenants);
  }

  async function loadDraft(slug: string) {
    const res = await fetch(`/api/dashboard/page-config?tenantSlug=${encodeURIComponent(slug)}`);
    const data = (await res.json()) as { ok: boolean; item?: DashboardItem; error?: string };
    if (!data.ok || !data.item) {
      setStatus(data.error || "Erro ao carregar draft");
      return;
    }
    setTitle(data.item.title);
    setContent(data.item.content);
    setVersion(data.item.version);
    setStatus(`Draft carregado (v${data.item.version})`);
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Entrando...");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, tenantSlug: loginTenant }),
    });
    const data = (await res.json()) as {
      ok: boolean;
      session?: SessionInfo;
      error?: string;
    };

    if (!data.ok || !data.session) {
      setStatus(data.error || "Falha no login");
      return;
    }

    setSession(data.session);
    setTenantSlug(data.session.tenantSlug);
    setStatus(`Sessão ativa: ${data.session.email} (${data.session.role})`);
    await loadTenantOptions();
    await loadDraft(data.session.tenantSlug);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    setTenants([]);
    setTenantSlug("");
    setVersion(0);
    setStatus("Sessão encerrada");
  }

  async function handleSwitchTenant(nextTenantSlug: string) {
    if (!session) return;
    setStatus("Trocando tenant...");

    const res = await fetch("/api/auth/switch-tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug: nextTenantSlug }),
    });

    const data = (await res.json()) as {
      ok: boolean;
      session?: SessionInfo;
      error?: string;
    };

    if (!data.ok || !data.session) {
      setStatus(data.error || "Erro ao trocar tenant");
      return;
    }

    setSession(data.session);
    setTenantSlug(data.session.tenantSlug);
    setStatus(`Tenant ativo: ${data.session.tenantSlug} (${data.session.role})`);
    await loadTenantOptions();
    await loadDraft(data.session.tenantSlug);
  }

  async function saveDraft() {
    if (!session?.canEdit) {
      setStatus("Sem permissão para salvar draft");
      return;
    }
    setStatus("Salvando draft...");
    const res = await fetch("/api/dashboard/page-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug: session.tenantSlug, title, content }),
    });
    const data = (await res.json()) as { ok: boolean; item?: DashboardItem; error?: string };
    if (!data.ok || !data.item) {
      setStatus(data.error || "Erro ao salvar draft");
      return;
    }
    setVersion(data.item.version);
    setStatus(`Draft salvo (v${data.item.version})`);
  }

  async function publish() {
    if (!session?.canEdit) {
      setStatus("Sem permissão para publicar");
      return;
    }
    setStatus("Publicando...");
    const res = await fetch("/api/dashboard/page-publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug: session.tenantSlug }),
    });
    const data = (await res.json()) as { ok: boolean; item?: DashboardItem; error?: string };
    if (!data.ok || !data.item) {
      setStatus(data.error || "Erro ao publicar");
      return;
    }
    setVersion(data.item.version);
    setStatus(`Publicado com sucesso (v${data.item.version})`);
  }

  return (
    <main style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 16 }}>Painel do produtor (MVP)</h1>

      {!session && !checkingSession ? (
        <form onSubmit={handleLogin} style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          <label>
            Email
            <input
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
              placeholder="seu@email.com"
            />
          </label>
          <label>
            Tenant slug
            <input
              value={loginTenant}
              onChange={(e) => setLoginTenant(e.target.value)}
              style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
              placeholder="cliente-demo"
            />
          </label>
          <button type="submit" style={{ width: 180, padding: 10 }}>
            Entrar
          </button>
        </form>
      ) : null}

      {session ? (
        <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          <label>
            Tenant ativo
            <select
              value={tenantSlug}
              onChange={(e) => handleSwitchTenant(e.target.value)}
              style={{ display: "block", width: "100%", padding: 8, marginTop: 4, opacity: 0.8 }}
            >
              {tenants.map((tenant) => (
                <option key={tenant.tenantId} value={tenant.tenantSlug}>
                  {tenant.tenantName} ({tenant.tenantSlug}) - {tenant.role}
                </option>
              ))}
            </select>
          </label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => loadDraft(tenantSlug)} style={{ width: 180, padding: 10 }}>
              Recarregar draft
            </button>
            <button onClick={handleLogout} style={{ width: 130, padding: 10 }}>
              Sair
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        <label>
          Titulo
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>

        <label>
          Nome do produto
          <input
            value={content.productName}
            onChange={(e) => setContent((prev) => ({ ...prev, productName: e.target.value }))}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>

        <label>
          Headline
          <input
            value={content.headline}
            onChange={(e) => setContent((prev) => ({ ...prev, headline: e.target.value }))}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>

        <label>
          Descricao
          <textarea
            value={content.description}
            onChange={(e) => setContent((prev) => ({ ...prev, description: e.target.value }))}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4, minHeight: 100 }}
          />
        </label>

        <label>
          Texto do CTA
          <input
            value={content.ctaText}
            onChange={(e) => setContent((prev) => ({ ...prev, ctaText: e.target.value }))}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={content.showPrices}
            onChange={(e) => setContent((prev) => ({ ...prev, showPrices: e.target.checked }))}
          />
          Mostrar preços
        </label>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button onClick={saveDraft} style={{ padding: "10px 14px" }} disabled={!session?.canEdit}>
          Salvar draft
        </button>
        <button onClick={publish} style={{ padding: "10px 14px" }} disabled={!session?.canEdit}>
          Publicar
        </button>
      </div>

      <p style={{ opacity: 0.8 }}>Versão atual: {version}</p>
      <p style={{ fontWeight: 600 }}>{status}</p>
      <p style={{ marginTop: 16 }}>
        URL pública: <code>/{tenantSlug}</code>
      </p>
    </main>
  );
}
