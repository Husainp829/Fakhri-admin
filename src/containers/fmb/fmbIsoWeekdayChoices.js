/** ISO weekdays: 1 = Monday … 7 = Sunday (matches API / plan) */
export const FMB_ISO_WEEKDAY_CHOICES = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 7, name: "Sunday" },
];

export const formatIsoWeekdayList = (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return "—";
  }
  const map = new Map(FMB_ISO_WEEKDAY_CHOICES.map((c) => [c.id, c.name.slice(0, 3)]));
  return [...ids]
    .sort((a, b) => a - b)
    .map((id) => map.get(id) ?? id)
    .join(", ");
};
