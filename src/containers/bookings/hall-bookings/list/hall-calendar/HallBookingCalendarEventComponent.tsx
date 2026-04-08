import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import type { HallBookingCalendarEvent } from "./types";

export function HallBookingCalendarEventComponent({ event }: { event: HallBookingCalendarEvent }) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const blocked = Boolean(event.isBlockedDate);

  return (
    <div style={{ color: "inherit", padding: 0 }}>
      <Typography variant="caption" display="block" sx={{ fontSize: isMobile ? "1.5vw" : "0.8vw" }}>
        {dayjs(event.start).format("h A")} - {dayjs(event.end).format("h A")}
        <br />
        {blocked && (
          <Box
            component="span"
            sx={{
              display: "block",
              fontWeight: 700,
              letterSpacing: 0.04,
              textTransform: "uppercase",
              fontSize: isMobile ? "1.35vw" : "0.65rem",
              opacity: 0.95,
            }}
          >
            Blocked
          </Box>
        )}
        {event.title}
        {!blocked && event.tentative && (
          <Box
            component="span"
            sx={{
              display: "block",
              mt: 0.35,
              alignSelf: "flex-start",
              width: "fit-content",
              maxWidth: "100%",
              px: 0.5,
              py: 0.2,
              borderRadius: 0.5,
              fontWeight: 800,
              letterSpacing: 0.08,
              textTransform: "uppercase",
              fontSize: isMobile ? "1.45vw" : "0.68rem",
              lineHeight: 1.2,
              color: (t) => t.palette.warning.light,
              bgcolor: (t) => alpha(t.palette.common.black, 0.55),
              border: (t) => `1px solid ${alpha(t.palette.warning.main, 0.95)}`,
              boxShadow: (t) =>
                `0 0 0 1px ${alpha(t.palette.common.black, 0.2)}, 0 1px 2px ${alpha(t.palette.common.black, 0.35)}`,
            }}
          >
            Tentative
          </Box>
        )}
        <br />
        {blocked && event.purpose}
      </Typography>
    </div>
  );
}
