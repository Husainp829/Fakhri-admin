/** Visual cue when a majlis has no sadarat linked (calendar + list). */
export const missingSadaratBorderLeft = "10px solid red";

export const majlisHasSadarat = (row) => Boolean(row?.sadarat?.id);
