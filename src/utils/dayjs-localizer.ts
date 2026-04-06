import { DateLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

type RangeArgs = { start: Date; end: Date };
type LocalFormat = (value: Date, format: string) => string;

const dayjsLocalizer = new DateLocalizer({
  formats: {
    dateFormat: "DD",
    dayFormat: "ddd DD/MM",
    weekdayFormat: "dddd",
    timeGutterFormat: "HH:mm",
    monthHeaderFormat: "MMMM YYYY",
    dayHeaderFormat: "dddd DD MMM",
    dayRangeHeaderFormat: (
      { start, end }: RangeArgs,
      _culture: string,
      local: { format: LocalFormat }
    ) => `${local.format(start, "DD MMM")} – ${local.format(end, "DD MMM")}`,
    agendaHeaderFormat: (
      { start, end }: RangeArgs,
      _culture: string,
      local: { format: LocalFormat }
    ) => `${local.format(start, "DD MMM")} – ${local.format(end, "DD MMM")}`,
    agendaDateFormat: "ddd DD MMM",
    agendaTimeFormat: "HH:mm",
    agendaTimeRangeFormat: (
      { start, end }: RangeArgs,
      _culture: string,
      local: { format: LocalFormat }
    ) => `${local.format(start, "HH:mm")} – ${local.format(end, "HH:mm")}`,
  },

  firstOfWeek() {
    return dayjs().localeData().firstDayOfWeek();
  },

  format(value: Date | string | number, format: string) {
    return dayjs(value).format(format);
  },

  parse(value: string, format: string) {
    return dayjs(value, format).toDate();
  },

  startOfWeek() {
    return dayjs().startOf("week").toDate();
  },

  getDay(value: Date | string | number) {
    return dayjs(value).day();
  },
});

export default dayjsLocalizer;
