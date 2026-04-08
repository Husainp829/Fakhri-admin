import type { Theme } from "@mui/material/styles";
import { ohbatMajlisTypeBackground } from "@/theme/ohbatMajlisTypeColor";
import { majlisHasSadarat, missingSadaratBorderLeft } from "../MissingSadaratHighlight";
import type { OhbatMajlisCalendarEvent } from "./types";

export function majlisCalendarEventStyle(theme: Theme, event: OhbatMajlisCalendarEvent) {
  const row = event.resource;
  const missingSadarat = row && !majlisHasSadarat(row);
  return {
    backgroundColor: ohbatMajlisTypeBackground(String(row?.type), theme),
    color: theme.palette.common.white,
    ...(missingSadarat ? { borderLeft: missingSadaratBorderLeft(theme) } : {}),
  };
}
