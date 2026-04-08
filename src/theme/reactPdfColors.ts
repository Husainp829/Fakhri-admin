/**
 * @react-pdf/renderer has no ThemeProvider. Colors follow the same merged light theme as the admin
 * (BW base + cached tenant `themeOptions`). Call at PDF render time so branding matches sessionStorage.
 */
import { createTheme } from "@mui/material/styles";
import { getBrandedThemeOptions } from "@/theme/brandedThemeOptions";

export function getReactPdfColors() {
  const p = createTheme(getBrandedThemeOptions().light).palette;
  return {
    pageBg: p.background.paper,
    border: p.divider,
    heading: p.primary.main,
    accentText: p.primary.dark,
    muted: p.text.disabled,
    passZmBg: p.success.light,
    passZmFg: p.success.dark,
    passBhBg: p.error.light,
    passBhFg: p.error.dark,
    passJmBg: p.warning.light,
    passJmFg: p.warning.dark,
  } as const;
}
