export type TenantContext = {
  slug: string;
};

export function resolveTenantByHost(hostname: string): TenantContext | null {
  const host = hostname.split(":")[0].toLowerCase();
  const parts = host.split(".");

  if (host === "localhost" || parts.length < 3) {
    return null;
  }

  return { slug: parts[0] };
}
