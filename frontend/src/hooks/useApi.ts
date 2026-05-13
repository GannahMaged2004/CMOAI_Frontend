import { request, getAuthHeaders, BASE_URL } from "../lib/api";

/**
 * Thin wrapper around the shared `request` helper (Bearer token, 401 refresh,
 * standardized errors). Use `request` directly or via this hook interchangeably.
 */
export function useApi() {
  return { request, getAuthHeaders, baseUrl: BASE_URL };
}
