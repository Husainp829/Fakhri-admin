import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Views } from "react-big-calendar";
import type { HallBookingCalendarEvent } from "./types";
import { useResourceCalendarView } from "@/components/resource-big-calendar/ResourceCalendarViewContext";
import { formatTime12, formatTime12Compact } from "@/utils/date-format";

function buildFullTooltip(event: HallBookingCalendarEvent): string {
  const time = `${formatTime12(event.start)} – ${formatTime12(event.end)}`;
  const parts = [time, event.title];
  if (event.isBlockedDate) parts.push("Blocked", event.purpose ?? "");
  if (event.tentative) parts.push("Tentative");
  return parts.filter(Boolean).join(" · ");
}

export function HallBookingCalendarEventComponent({ event }: { event: HallBookingCalendarEvent }) {
  const muiTheme = useTheme();
  const view = useResourceCalendarView();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const blocked = Boolean(event.isBlockedDate);
  const tooltip = buildFullTooltip(event);

  if (view === Views.MONTH) {
    const start = formatTime12Compact(event.start);
    const status = (blocked && "Blocked") || (event.tentative ? "T" : "") || "";
    const primary = blocked ? (event.purpose ?? "Blocked").trim() || "Blocked" : event.title;
    const line = status ? `${start} · ${status} · ${primary}` : `${start} · ${primary}`;

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
          fontWeight: blocked ? 700 : 500,
        }}
      >
        {line}
      </Box>
    );
  }

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
      {blocked && (
        <Typography
          variant="caption"
          component="div"
          sx={{
            fontWeight: 700,
            letterSpacing: 0.04,
            textTransform: "uppercase",
            fontSize: "0.65rem",
            opacity: 0.95,
            lineHeight: 1.2,
          }}
        >
          Blocked
        </Typography>
      )}
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
      {!blocked && event.tentative && (
        <Box
          component="span"
          sx={{
            display: "inline-block",
            mt: 0.25,
            px: 0.5,
            py: 0.1,
            borderRadius: 0.5,
            fontWeight: 800,
            letterSpacing: 0.06,
            textTransform: "uppercase",
            fontSize: "0.6rem",
            lineHeight: 1.15,
            color: (t) => t.palette.warning.light,
            bgcolor: (t) => alpha(t.palette.common.black, 0.45),
            border: (t) => `1px solid ${alpha(t.palette.warning.main, 0.9)}`,
          }}
        >
          Tentative
        </Box>
      )}
      {blocked && event.purpose && (
        <Typography variant="caption" component="div" sx={{ opacity: 0.9, lineHeight: 1.2 }}>
          {event.purpose}
        </Typography>
      )}
    </Box>
  );
}
