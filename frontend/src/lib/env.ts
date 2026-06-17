const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "/api/v1";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export function getBackendOrigin(): string {
  if (!API_BASE_URL.startsWith("http://") && !API_BASE_URL.startsWith("https://")) {
    return "";
  }

  try {
    const url = new URL(API_BASE_URL);
    return url.origin;
  } catch {
    return "";
  }
}

export function resolveBackendUrl(path: string): string {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const origin = getBackendOrigin();
  return origin ? `${origin}${normalizedPath}` : normalizedPath;
}
