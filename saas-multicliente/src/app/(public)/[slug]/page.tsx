import { getLatestLandingDraftByTenant } from "@/lib/db";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getLatestLandingDraftByTenant(slug, "published");

  if (!page) {
    return (
      <main style={{ padding: "40px", maxWidth: 900, margin: "0 auto" }}>
        <h1>Landing pública</h1>
        <p>Tenant/slug: {slug}</p>
        <p>Este cliente ainda não publicou a página.</p>
      </main>
    );
  }

  const content = page.content;

  return (
    <main style={{ padding: "40px", maxWidth: 900, margin: "0 auto", lineHeight: 1.5 }}>
      <p style={{ marginBottom: 10, opacity: 0.7 }}>Tenant: {slug}</p>
      <h1 style={{ marginBottom: 10 }}>{content.productName}</h1>
      <h2 style={{ marginBottom: 14, fontSize: 24 }}>{content.headline}</h2>
      <p style={{ marginBottom: 24 }}>{content.description}</p>

      {content.showPrices ? (
        <section style={{ marginBottom: 24 }}>
          <h3>Precios</h3>
          <ul>
            <li>Starter: ${content.prices.starter}/mes</li>
            <li>Pro: ${content.prices.pro}/mes</li>
            <li>Enterprise: ${content.prices.enterprise}/mes</li>
          </ul>
        </section>
      ) : (
        <section style={{ marginBottom: 24 }}>
          <h3>Precios</h3>
          <p>Precio bajo consulta.</p>
        </section>
      )}

      <button
        style={{
          background: "#111",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "12px 18px",
          fontWeight: 700,
        }}
      >
        {content.ctaText}
      </button>
    </main>
  );
}
