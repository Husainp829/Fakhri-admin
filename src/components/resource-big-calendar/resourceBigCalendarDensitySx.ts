import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";

/** Scoped react-big-calendar tweaks (month overflow, overlays, time grid density). */
export function resourceBigCalendarDensitySx(theme: Theme): SystemStyleObject<Theme> {
  return {
    "& .rbc-month-row .rbc-row-content .rbc-event": {
      overflow: "hidden",
    },
    "& .rbc-month-row .rbc-row-content .rbc-event-content": {
      overflow: "hidden",
      width: "100%",
    },
    "& .rbc-month-row .rbc-row-content .rbc-row-segment": {
      padding: "0 1px 1px",
    },
    "& .rbc-show-more": {
      fontWeight: 600,
      fontSize: "0.7rem",
      lineHeight: 1.2,
      color: theme.palette.primary.main,
      backgroundColor: "transparent",
      padding: "1px 2px",
      textAlign: "left",
    },
    "& .rbc-overlay": {
      borderRadius: 1,
      boxShadow: theme.shadows[8],
      border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === "dark" ? 0.5 : 1)}`,
      backgroundColor: theme.palette.background.paper,
    },
    "& .rbc-overlay-header": {
      borderBottom: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(1, 1.25),
      fontWeight: 600,
      fontSize: "0.875rem",
    },
    "& .rbc-time-content": {
      borderTop: `1px solid ${theme.palette.divider}`,
    },
    "& .rbc-time-view .rbc-event": {
      borderRadius: "4px",
    },
    "& .rbc-time-view .rbc-event-label": {
      fontSize: "0.65rem",
    },
  };
}
