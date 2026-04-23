import { formatMajlisStartTimeLabel } from "@/utils/date-format";

export { formatMajlisStartTimeLabel };

/** 15-minute steps; `id` is HH:mm (24h) for API; `name` is 12-hour for UI */
export const MAJLIS_START_TIME_CHOICES = Array.from({ length: 96 }, (_, i) => {
  const totalMinutes = i * 15;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const id = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return { id, name: formatMajlisStartTimeLabel(id) };
});
