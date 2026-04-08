import { useMemo } from "react";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import startCase from "lodash/startCase";
import { alphaOnSurface } from "@/theme/surfaceAlpha";
import { ohbatMajlisTypeBackground } from "@/theme/ohbatMajlisTypeColor";
import { majlisHasSadarat } from "../MissingSadaratHighlight";
import type { OhbatMajlisCalendarEvent } from "./types";

type TypeLegendItem = {
  key: string;
  label: string;
  typeKey: string;
};

function buildTypeLegendItems(events: OhbatMajlisCalendarEvent[]): TypeLegendItem[] {
  const byKey = new Map<string, TypeLegendItem>();
  for (const ev of events) {
    const raw = String(ev.resource?.type ?? "");
    const key = raw || "__other__";
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        label: raw ? startCase(raw) : "Other",
        typeKey: raw,
      });
    }
  }
  return [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function calendarHasMissingSadarat(events: OhbatMajlisCalendarEvent[]): boolean {
  return events.some((e) => e.resource && !majlisHasSadarat(e.resource));
}

export function OhbatMajlisCalendarLegend({ events }: { events: OhbatMajlisCalendarEvent[] }) {
  const theme = useTheme();
  const typeItems = useMemo(() => buildTypeLegendItems(events), [events]);
  const showMissingSadarat = useMemo(() => calendarHasMissingSadarat(events), [events]);
  const isDark = theme.palette.mode === "dark";
  const legendScrollRow = useMediaQuery(theme.breakpoints.down("sm"));

  if (typeItems.length === 0 && !showMissingSadarat) {
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
      aria-label="Majlis type legend"
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
        {typeItems.map((item) => (
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
                bgcolor: ohbatMajlisTypeBackground(item.typeKey, theme),
                ...swatchBorder,
              }}
            />
            <Typography variant="body2" color="text.primary" noWrap title={item.label}>
              {item.label}
            </Typography>
          </Stack>
        ))}
        {showMissingSadarat && (
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
                display: "flex",
                overflow: "hidden",
                border: "1px solid",
                borderColor: alphaOnSurface(theme, 0.22, 0.12),
                boxShadow: isDark
                  ? `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.06)}`
                  : "none",
              }}
            >
              <Box sx={{ width: 5, flexShrink: 0, bgcolor: "error.main" }} />
              <Box sx={{ flex: 1, minWidth: 0, bgcolor: "action.hover" }} />
            </Box>
            <Typography variant="body2" color="text.secondary" noWrap title="Missing sadarat">
              Missing sadarat (red edge)
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
