import { useMemo } from "react";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { alphaOnSurface } from "@/theme/surfaceAlpha";
import type { HallBookingCalendarEvent } from "./types";
import { hallCalendarDisplayColor } from "./hallCalendarColors";

type LegendHall = {
  id?: string;
  name?: string;
  shortCode?: string;
  color?: string | null;
};

type LegendHallItem = {
  key: string;
  label: string;
  hall: LegendHall | undefined;
};

function hallLegendKey(hall: LegendHall | undefined): string {
  const id = hall?.id?.trim();
  const name = hall?.name?.trim() ?? "";
  const code = hall?.shortCode?.trim() ?? "";
  return id || (code || name ? `${code}\0${name}` : "");
}

function hallLegendLabel(hall: LegendHall | undefined): string {
  const name = hall?.name?.trim() ?? "";
  const code = hall?.shortCode?.trim() ?? "";
  if (name && code) return `${name} (${code})`;
  return name || code || "Hall";
}

function buildHallLegendItems(events: HallBookingCalendarEvent[]): LegendHallItem[] {
  const byKey = new Map<string, LegendHallItem>();

  for (const ev of events) {
    if (ev.isBlockedDate) continue;

    const hall = ev.resource?.hall;
    const key = hallLegendKey(hall);
    if (!key) continue;

    const label = hallLegendLabel(hall);
    if (!byKey.has(key)) {
      byKey.set(key, { key, label, hall });
    }
  }

  return [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function calendarHasBlockedDates(events: HallBookingCalendarEvent[]): boolean {
  return events.some((e) => e.isBlockedDate);
}

function calendarHasTentativeBookings(events: HallBookingCalendarEvent[]): boolean {
  return events.some((e) => !e.isBlockedDate && e.tentative);
}

export function HallBookingsCalendarLegend({ events }: { events: HallBookingCalendarEvent[] }) {
  const theme = useTheme();
  const hallItems = useMemo(() => buildHallLegendItems(events), [events]);
  const showBlocked = useMemo(() => calendarHasBlockedDates(events), [events]);
  const showTentative = useMemo(() => calendarHasTentativeBookings(events), [events]);
  const isDark = theme.palette.mode === "dark";
  const legendScrollRow = useMediaQuery(theme.breakpoints.down("sm"));

  if (hallItems.length === 0 && !showBlocked && !showTentative) {
    return null;
  }

  const swatchBorder = {
    border: "1px solid",
    borderColor: alphaOnSurface(theme, 0.28, 0.12),
    boxShadow: isDark ? `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.06)}` : "none",
  };

  return (
    <Box
      role="region"
      aria-label="Hall color legend"
      sx={{
        flexShrink: 0,
        pt: 1,
        pb: 1,
        px: 2,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1.25}
        useFlexGap
        sx={{
          flexWrap: legendScrollRow ? "nowrap" : "wrap",
          rowGap: 0.75,
          ...(legendScrollRow && {
            overflowX: "auto",
            overflowY: "hidden",
            pb: 0.25,
            WebkitOverflowScrolling: "touch",
            scrollbarGutter: "stable",
          }),
        }}
      >
        {hallItems.map((item) => (
          <Stack
            key={item.key}
            direction="row"
            alignItems="center"
            gap={0.75}
            sx={{ flexShrink: 0, maxWidth: legendScrollRow ? "none" : "100%" }}
          >
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: 0.5,
                flexShrink: 0,
                bgcolor: hallCalendarDisplayColor(theme, item.hall),
                ...swatchBorder,
              }}
            />
            <Typography variant="body2" color="text.primary" noWrap title={item.label}>
              {item.label}
            </Typography>
          </Stack>
        ))}
        {showBlocked && (
          <Stack
            direction="row"
            alignItems="center"
            gap={0.75}
            sx={{ flexShrink: 0, maxWidth: legendScrollRow ? "none" : "100%" }}
          >
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: 0.5,
                flexShrink: 0,
                bgcolor: "action.disabledBackground",
                border: "1px solid",
                borderColor: alphaOnSurface(theme, 0.22, 0.12),
              }}
            />
            <Typography variant="body2" color="text.secondary" noWrap title="Blocked dates">
              Blocked dates
            </Typography>
          </Stack>
        )}
        {showTentative && (
          <Stack
            direction="row"
            alignItems="center"
            gap={0.75}
            sx={{ flexShrink: 0, maxWidth: legendScrollRow ? "none" : "100%" }}
          >
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: 0.5,
                flexShrink: 0,
                bgcolor: (t) => alpha(t.palette.common.black, 0.55),
                border: "1px solid",
                borderColor: alpha(theme.palette.warning.main, 0.95),
                boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.black, 0.15)}`,
              }}
            />
            <Typography
              variant="body2"
              color="text.primary"
              noWrap
              title="No deposit or payment recorded"
            >
              Tentative booking
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
