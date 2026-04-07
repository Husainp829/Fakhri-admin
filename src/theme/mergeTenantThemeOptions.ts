import { deepmerge } from "@mui/utils";
import type { ThemeOptions } from "@mui/material/styles";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Normalizes API `themeOptions` JSON:
 * - `{ light?: ThemeOptions, dark?: ThemeOptions }` — per-mode overrides
 * - Any other object — treated as light-only `ThemeOptions`
 */
export function splitTenantThemeOptions(raw: unknown): {
  light: ThemeOptions;
  dark: ThemeOptions;
} {
  if (!isRecord(raw)) {
    return { light: {}, dark: {} };
  }
  if ("light" in raw || "dark" in raw) {
    const l = raw.light;
    const d = raw.dark;
    return {
      light: isRecord(l) ? (l as ThemeOptions) : {},
      dark: isRecord(d) ? (d as ThemeOptions) : {},
    };
  }
  return { light: raw as ThemeOptions, dark: {} };
}

export function mergeTenantBrandedThemes(
  baseLight: ThemeOptions,
  baseDark: ThemeOptions,
  themeOptionsFromApi: unknown
): { light: ThemeOptions; dark: ThemeOptions } {
  const { light, dark } = splitTenantThemeOptions(themeOptionsFromApi);
  return {
    light: deepmerge(baseLight, light) as ThemeOptions,
    dark: deepmerge(baseDark, dark) as ThemeOptions,
  };
}
