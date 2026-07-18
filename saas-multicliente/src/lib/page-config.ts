export type LandingContent = {
  productName: string;
  headline: string;
  description: string;
  ctaText: string;
  showPrices: boolean;
  prices: {
    starter: string;
    pro: string;
    enterprise: string;
  };
};

export const defaultLandingContent: LandingContent = {
  productName: "Nova",
  headline: "El copiloto de IA que convierte el caos de tu negocio en decisiones claras",
  description:
    "Nova conecta tus datos, automatiza tareas repetitivas y te entrega respuestas listas para actuar.",
  ctaText: "Probar gratis",
  showPrices: true,
  prices: {
    starter: "19",
    pro: "49",
    enterprise: "129",
  },
};

export function normalizeLandingContent(input: unknown): LandingContent {
  if (!input || typeof input !== "object") {
    return { ...defaultLandingContent, prices: { ...defaultLandingContent.prices } };
  }

  const body = input as Record<string, unknown>;
  const pricesBody =
    body.prices && typeof body.prices === "object"
      ? (body.prices as Record<string, unknown>)
      : {};

  return {
    productName: String(body.productName || defaultLandingContent.productName).trim(),
    headline: String(body.headline || defaultLandingContent.headline).trim(),
    description: String(body.description || defaultLandingContent.description).trim(),
    ctaText: String(body.ctaText || defaultLandingContent.ctaText).trim(),
    showPrices: Boolean(body.showPrices ?? defaultLandingContent.showPrices),
    prices: {
      starter: String(pricesBody.starter || defaultLandingContent.prices.starter).trim(),
      pro: String(pricesBody.pro || defaultLandingContent.prices.pro).trim(),
      enterprise: String(pricesBody.enterprise || defaultLandingContent.prices.enterprise).trim(),
    },
  };
}
