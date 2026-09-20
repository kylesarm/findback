const INTERNAL_ORIGIN = "https://findmatch.internal";

export function safeNextPath(path, fallback = "/dashboard") {
  if (typeof path !== "string" || !path.startsWith("/")) return fallback;

  try {
    const parsed = new URL(path, INTERNAL_ORIGIN);
    if (parsed.origin !== INTERNAL_ORIGIN) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
