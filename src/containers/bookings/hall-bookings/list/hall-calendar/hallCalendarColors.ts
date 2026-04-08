import type { CSSProperties } from "react";
import { alpha, darken } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { HallBookingCalendarEvent } from "./types";

/** Darken API hex (or grey fallback) so hall chips read calmer on dark surfaces — MUI `darken`, not CSS filters. */
const HALL_FILL_DARKEN = 0.22;

const API_HEX_6 = /^#[0-9A-Fa-f]{6}$/;
const API_HEX_3 = /^#([0-9A-Fa-f]{3})$/;

export function normalizeApiHexColor(raw: string): string | null {
  const s = raw.trim();
  if (API_HEX_6.test(s)) return s;
  const m = s.match(API_HEX_3);
  if (m?.[1]) {
    const [a, b, c] = m[1].split("");
    return `#${a}${a}${b}${b}${c}${c}`;
  }
  return null;
}

/** Prefer `hall.color` from API; otherwise neutral grey. */
export function hallCalendarBackgroundColor(
  hall: { color?: string | null; shortCode?: string } | undefined
): string {
  const raw = typeof hall?.color === "string" ? hall.color.trim() : "";
  const normalized = raw ? normalizeApiHexColor(raw) : null;
  if (normalized) {
    return normalized;
  }
  return "grey";
}

/**
 * Hall background as shown in the calendar / legend: light mode uses the raw API color; dark mode
 * uses MUI `darken` on that color.
 */
export function hallCalendarDisplayColor(
  theme: Theme,
  hall: { color?: string | null; shortCode?: string } | undefined
): string {
  const base = hallCalendarBackgroundColor(hall);
  if (theme.palette.mode !== "dark") {
    return base;
  }
  if (base.startsWith("#")) {
    return darken(base, HALL_FILL_DARKEN);
  }
  return darken(theme.palette.grey[500], HALL_FILL_DARKEN);
}

/** Muted “disabled” look for blocked slots (not hall-specific). */
export function blockedSlotEventStyle(theme: Theme): CSSProperties {
  return {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.text.disabled,
    border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === "dark" ? 0.55 : 1)}`,
  };
}

/** Non-blocked hall events: solid fill from `hallCalendarDisplayColor` (raw vs MUI-darkened). */
export function hallBookingEventShellStyle(
  theme: Theme,
  event: HallBookingCalendarEvent
): CSSProperties {
  if (event.isBlockedDate) {
    return blockedSlotEventStyle(theme);
  }
  const hall = event.resource?.hall;
  return {
    backgroundColor: hallCalendarDisplayColor(theme, hall),
    color: theme.palette.common.white,
  };
}
