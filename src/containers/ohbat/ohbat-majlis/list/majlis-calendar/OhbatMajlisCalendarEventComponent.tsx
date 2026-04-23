import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Views } from "react-big-calendar";
import { formatTime12, formatTime12Compact } from "@/utils/date-format";
import { useResourceCalendarView } from "@/components/resource-big-calendar/ResourceCalendarViewContext";
import { majlisHasSadarat } from "../MissingSadaratHighlight";
import type { OhbatMajlisCalendarEvent } from "./types";

function sadaratDisplayName(s: { name?: string; itsNo?: string } | null | undefined): string {
  if (!s) return "";
  const n = s.name?.trim();
  if (n) return n;
  const its = s.itsNo?.trim();
  if (its) return its;
  return "";
}

function buildFullTooltip(event: OhbatMajlisCalendarEvent): string {
  const time = `${formatTime12(event.start)} – ${formatTime12(event.end)}`;
  const row = event.resource;
  const missingSadarat = row && !majlisHasSadarat(row);
  const sadarat = row?.sadarat as { name?: string; itsNo?: string; mobile?: string } | undefined;
  const sadaratName = !missingSadarat ? sadaratDisplayName(sadarat) : "";
  const parts = [time, event.title, event.subTitle];
  if (sadaratName) parts.push(`Sadarat: ${sadaratName}`);
  if (missingSadarat) parts.push("No sadarat");
  return parts.filter(Boolean).join(" · ");
}

export function OhbatMajlisCalendarEventComponent({ event }: { event: OhbatMajlisCalendarEvent }) {
  const muiTheme = useTheme();
  const view = useResourceCalendarView();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const row = event.resource;
  const missingSadarat = row && !majlisHasSadarat(row);
  const sadarat = row?.sadarat as { name?: string; itsNo?: string; mobile?: string } | undefined;
  const sadaratName = !missingSadarat ? sadaratDisplayName(sadarat) : "";
  const sadaratMobile = sadarat?.mobile?.trim();
  const tooltip = buildFullTooltip(event);

  if (view === Views.MONTH) {
    const start = formatTime12Compact(event.start);
    const flag = missingSadarat ? "!" : "";
    const line = flag ? `${start} · ${event.title} · ${flag}` : `${start} · ${event.title}`;

    return (
      <Box
        title={tooltip}
        sx={{
          color: "inherit",
          px: 0,
          py: 0,
          minWidth: 0,
          width: "100%",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          fontSize: isMobile ? "0.65rem" : "0.7rem",
          lineHeight: 1.2,
          fontWeight: missingSadarat ? 600 : 500,
        }}
      >
        {line}
      </Box>
    );
  }

  const secondarySx = {
    mt: 0.25,
    fontSize: isMobile ? "0.65rem" : "0.68rem",
    lineHeight: 1.25,
    opacity: 0.95,
    wordBreak: "break-word" as const,
  };

  return (
    <Box
      title={tooltip}
      sx={{
        color: "inherit",
        p: 0,
        minWidth: 0,
        width: "100%",
        overflow: "hidden",
        fontSize: isMobile ? "0.68rem" : "0.75rem",
        lineHeight: 1.25,
      }}
    >
      <Typography
        variant="caption"
        component="div"
        sx={{
          fontWeight: 700,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "block",
        }}
      >
        {formatTime12(event.start)} – {formatTime12(event.end)}
      </Typography>
      <Typography
        variant="caption"
        component="div"
        sx={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          wordBreak: "break-word",
        }}
      >
        {event.title}
      </Typography>
      {event.subTitle && (
        <Typography
          variant="caption"
          component="div"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            opacity: 0.92,
          }}
        >
          {event.subTitle}
        </Typography>
      )}
      {sadaratName && (
        <Box component="span" sx={secondarySx}>
          Sadarat: {sadaratName}
          {sadaratMobile ? ` · ${sadaratMobile}` : ""}
        </Box>
      )}
      {missingSadarat && (
        <Box component="span" sx={{ ...secondarySx, fontStyle: "italic", opacity: 0.92 }}>
          No sadarat
        </Box>
      )}
    </Box>
  );
}
