import { bwDarkTheme, bwLightTheme } from "react-admin";
import { deepmerge } from "@mui/utils";
import type { ThemeOptions } from "@mui/material/styles";
import { readStoredTenantBrandingTheme } from "@/utils/tenant-branding-cache";
import { mergeTenantBrandedThemes } from "@/theme/mergeTenantThemeOptions";
import { tableZebraThemeFragment } from "@/theme/tableZebraTheme";

/**
 * Light/dark theme options passed to `<Admin theme={…} />`, after tenant `themeOptions`
 * from sessionStorage and table zebra striping — same merge as {@link useTenantBrandedThemes}.
 */
export function getBrandedThemeOptions(): { light: ThemeOptions; dark: ThemeOptions } {
  const m = mergeTenantBrandedThemes(bwLightTheme, bwDarkTheme, readStoredTenantBrandingTheme());
  return {
    light: deepmerge(m.light, tableZebraThemeFragment) as ThemeOptions,
    dark: deepmerge(m.dark, tableZebraThemeFragment) as ThemeOptions,
  };
}
