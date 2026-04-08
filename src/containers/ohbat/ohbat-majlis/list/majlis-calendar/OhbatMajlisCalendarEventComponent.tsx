import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import dayjs from "dayjs";
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

export function OhbatMajlisCalendarEventComponent({ event }: { event: OhbatMajlisCalendarEvent }) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const row = event.resource;
  const missingSadarat = row && !majlisHasSadarat(row);
  const sadarat = row?.sadarat as { name?: string; itsNo?: string; mobile?: string } | undefined;
  const sadaratName = !missingSadarat ? sadaratDisplayName(sadarat) : "";
  const sadaratMobile = sadarat?.mobile?.trim();
  const captionSx = { fontSize: isMobile ? "3vw" : "10px" };
  const secondarySx = {
    mt: 0.25,
    fontSize: isMobile ? "2.6vw" : "9px",
    lineHeight: 1.25,
    opacity: 0.95,
    wordBreak: "break-word" as const,
  };

  return (
    <div style={{ color: "inherit", padding: 0 }}>
      <Typography variant="caption" display="block" sx={captionSx}>
        {dayjs(event.start).format("h:mm A")} – {dayjs(event.end).format("h:mm A")}
        <br />
        {event.title}
        <br />
        {event.subTitle}
        {sadaratName && (
          <>
            <br />
            <Box component="span" sx={secondarySx}>
              Sadarat: {sadaratName}
              {sadaratMobile ? ` · ${sadaratMobile}` : ""}
            </Box>
          </>
        )}
        {missingSadarat && (
          <>
            <br />
            <Box
              component="span"
              sx={{
                ...secondarySx,
                fontStyle: "italic",
                opacity: 0.92,
              }}
            >
              No sadarat
            </Box>
          </>
        )}
      </Typography>
    </div>
  );
}
