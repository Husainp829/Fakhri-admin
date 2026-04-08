import type { Theme } from "@mui/material/styles";

/**
 * Distinct sequence for Recharts (bars, pie slices). Resolved from the active theme
 * so tenant branding and light/dark mode apply to dashboards.
 */
export function getChartColorSequence(theme: Theme): string[] {
  const p = theme.palette;
  return [
    p.primary.main,
    p.success.main,
    p.warning.main,
    p.error.main,
    p.info.main,
    p.secondary.main,
    p.primary.dark,
    p.success.dark,
  ];
}
