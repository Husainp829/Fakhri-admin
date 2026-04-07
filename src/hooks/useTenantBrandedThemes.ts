import { useEffect, useState } from "react";
import { deepmerge } from "@mui/utils";
import type { ThemeOptions } from "@mui/material/styles";
import {
  fetchAndStoreTenantBrandingTheme,
  readStoredTenantBrandingTheme,
  TENANT_BRANDING_UPDATED_EVENT,
} from "@/utils/tenant-branding-cache";
import { mergeTenantBrandedThemes } from "@/theme/mergeTenantThemeOptions";
import { tableZebraThemeFragment } from "@/theme/tableZebraTheme";
import { bwDarkTheme, bwLightTheme } from "react-admin";

function withTableZebra(
  light: ThemeOptions,
  dark: ThemeOptions
): {
  light: ThemeOptions;
  dark: ThemeOptions;
} {
  return {
    light: deepmerge(light, tableZebraThemeFragment) as ThemeOptions,
    dark: deepmerge(dark, tableZebraThemeFragment) as ThemeOptions,
  };
}

/**
 * BW base themes + per-tenant `themeOptions` from `GET /tenant-branding/me`, with table zebra striping.
 */
export function useTenantBrandedThemes(): { light: ThemeOptions; dark: ThemeOptions } {
  const [themes, setThemes] = useState(() => {
    const m = mergeTenantBrandedThemes(bwLightTheme, bwDarkTheme, readStoredTenantBrandingTheme());
    return withTableZebra(m.light, m.dark);
  });

  useEffect(() => {
    const applyStoredBranding = () => {
      const m = mergeTenantBrandedThemes(
        bwLightTheme,
        bwDarkTheme,
        readStoredTenantBrandingTheme()
      );
      setThemes(withTableZebra(m.light, m.dark));
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
