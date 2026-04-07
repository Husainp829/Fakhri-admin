import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";

/**
 * react-big-calendar ships light-only CSS (e.g. `.rbc-off-range-bg` #e6e6e6).
 * Scope overrides under the calendar wrapper so default light behavior stays unchanged.
 */
export function reactBigCalendarWrapperSx(theme: Theme): SystemStyleObject<Theme> {
  const base: SystemStyleObject<Theme> = {
    fontFamily: theme.typography.fontFamily,
  };

  if (theme.palette.mode !== "dark") {
    return base;
  }

  return {
    ...base,
    "& .rbc-off-range": {
      color: theme.palette.text.secondary,
    },
    "& .rbc-off-range-bg": {
      background: alpha(theme.palette.common.white, 0.06),
    },
    "& .rbc-today": {
      backgroundColor: alpha(theme.palette.primary.main, 0.18),
    },
  };
}
