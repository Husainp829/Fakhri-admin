import type { Theme } from "@mui/material/styles";
import type { RaRecord } from "react-admin";

/** Visual cue when a majlis has no sadarat linked (calendar + list). */
export function missingSadaratBorderLeft(theme: Theme): string {
  return `10px solid ${theme.palette.error.main}`;
}

export const majlisHasSadarat = (row: RaRecord | null | undefined): boolean =>
  Boolean((row?.sadarat as { id?: unknown } | null | undefined)?.id);
