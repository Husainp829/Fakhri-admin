import { useEffect, useState } from "react";
import type { ThemeOptions } from "@mui/material/styles";
import {
  fetchAndStoreTenantBrandingTheme,
  TENANT_BRANDING_UPDATED_EVENT,
} from "@/utils/tenant-branding-cache";
import { getBrandedThemeOptions } from "@/theme/brandedThemeOptions";

/**
 * BW base themes + per-tenant `themeOptions` from `GET /tenant-branding/me`, with table zebra striping.
 */
export function useTenantBrandedThemes(): { light: ThemeOptions; dark: ThemeOptions } {
  const [themes, setThemes] = useState(() => getBrandedThemeOptions());

  useEffect(() => {
    const applyStoredBranding = () => {
      setThemes(getBrandedThemeOptions());
    };
    window.addEventListener(TENANT_BRANDING_UPDATED_EVENT, applyStoredBranding);
    return () => window.removeEventListener(TENANT_BRANDING_UPDATED_EVENT, applyStoredBranding);
  }, []);

  useEffect(() => {
    void fetchAndStoreTenantBrandingTheme().catch(() => {
      /* not logged in yet or offline */
    });
  }, []);

  return themes;
}
