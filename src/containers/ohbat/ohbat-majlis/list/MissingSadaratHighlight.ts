import type { RaRecord } from "react-admin";

/** Visual cue when a majlis has no sadarat linked (calendar + list). */
export const missingSadaratBorderLeft = "10px solid red";

export const majlisHasSadarat = (row: RaRecord | null | undefined): boolean =>
  Boolean((row?.sadarat as { id?: unknown } | null | undefined)?.id);
