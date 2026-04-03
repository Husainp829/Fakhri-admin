import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

/** 15-minute steps; `id` is HH:mm (24h) for API; `name` is 12-hour for UI */
export const MAJLIS_START_TIME_CHOICES = Array.from({ length: 96 }, (_, i) => {
  const totalMinutes = i * 15;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const id = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const name = dayjs(id, "HH:mm", true).format("h:mm A");
  return { id, name };
});

export function formatMajlisStartTimeLabel(hhmm) {
  if (hhmm == null || String(hhmm).trim() === "") return "—";
  const d = dayjs(String(hhmm).trim(), "HH:mm", true);
  return d.isValid() ? d.format("h:mm A") : String(hhmm);
}
