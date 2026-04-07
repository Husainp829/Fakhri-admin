import { getApiUrl, TENANT_BRANDING_THEME_STORAGE_KEY } from "@/constants";
import httpClient from "@/dataprovider/http-client";

/** Fired after `themeOptions` is written to sessionStorage (login or refresh). */
export const TENANT_BRANDING_UPDATED_EVENT = "fakhri-tenant-branding-updated";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * GET current tenant branding and cache raw `themeOptions` in sessionStorage.
 * Dispatches {@link TENANT_BRANDING_UPDATED_EVENT} on success.
 */
export async function fetchAndStoreTenantBrandingTheme(): Promise<unknown | undefined> {
  const url = `${getApiUrl()}/tenant-branding/me`;
  const { json } = await httpClient(url);
  if (!isRecord(json)) return undefined;
  const rows = json.rows;
  if (!Array.isArray(rows) || rows.length === 0) return undefined;
  const first = rows[0];
  if (!isRecord(first) || !("themeOptions" in first)) return undefined;
  const themeOptions = first.themeOptions ?? {};
  sessionStorage.setItem(TENANT_BRANDING_THEME_STORAGE_KEY, JSON.stringify(themeOptions));
  window.dispatchEvent(new Event(TENANT_BRANDING_UPDATED_EVENT));
  return themeOptions;
}

export function readStoredTenantBrandingTheme(): unknown {
  try {
    const s = sessionStorage.getItem(TENANT_BRANDING_THEME_STORAGE_KEY);
    if (!s) return undefined;
    return JSON.parse(s) as unknown;
  } catch {
    return undefined;
  }
}
