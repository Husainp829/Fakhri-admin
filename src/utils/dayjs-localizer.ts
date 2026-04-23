import { DateLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { APP_DISPLAY_DATE, DatePattern } from "./date-format";

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

type RangeArgs = { start: Date; end: Date };
type LocalFormat = (value: Date, format: string) => string;

const dayjsLocalizer = new DateLocalizer({
  formats: {
    dateFormat: "DD",
    dayFormat: `ddd, ${APP_DISPLAY_DATE}`,
    weekdayFormat: "dddd",
    timeGutterFormat: "HH:mm",
    monthHeaderFormat: APP_DISPLAY_DATE,
    dayHeaderFormat: `dddd, ${APP_DISPLAY_DATE}`,
    dayRangeHeaderFormat: (
      { start, end }: RangeArgs,
      _culture: string,
      local: { format: LocalFormat }
    ) => `${local.format(start, APP_DISPLAY_DATE)} – ${local.format(end, APP_DISPLAY_DATE)}`,
    agendaHeaderFormat: (
      { start, end }: RangeArgs,
      _culture: string,
      local: { format: LocalFormat }
    ) => `${local.format(start, APP_DISPLAY_DATE)} – ${local.format(end, APP_DISPLAY_DATE)}`,
    agendaDateFormat: `ddd, ${APP_DISPLAY_DATE}`,
    agendaTimeFormat: "HH:mm",
    agendaTimeRangeFormat: (
      { start, end }: RangeArgs,
      _culture: string,
      local: { format: LocalFormat }
    ) => `${local.format(start, DatePattern.TIME_24)} – ${local.format(end, DatePattern.TIME_24)}`,
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
