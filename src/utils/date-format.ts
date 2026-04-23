import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import type { AdapterFormats } from "@mui/x-date-pickers/models";

dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

/** Single canonical date display for the admin UI (e.g. 23-Apr-2026). */
export const APP_DISPLAY_DATE = "DD-MMM-YYYY" as const;

/**
 * Dayjs format tokens that are not the canonical {@link APP_DISPLAY_DATE}.
 * For calendar days shown to users, prefer {@link formatListDate}.
 */
export const DatePattern = {
  ISO_DATE: "YYYY-MM-DD",
  ISO_MONTH: "YYYY-MM",
  EXPORT_STAMP: "YYYY-MM-DD_HH-mm-ss",
  TIME_24: "HH:mm",
  TIME_12: "h:mm A",
  TIME_12_COMPACT: "h A",
  HOUR_12_TIGHT: "ha",
  WEEKDAY_FULL: "dddd",
  WEEKDAY_SHORT: "ddd",
  /** MUI DatePicker `format` — weekday + canonical date */
  DISPLAY_DOW_DD_MMM_YY: `ddd, ${APP_DISPLAY_DATE}`,
} as const;

/** Month + year only (MUI `DatePicker` with `views={['month','year']}`). */
export const MUI_MONTH_YEAR_PICKER_FORMAT = "MMM YYYY" as const;

/**
 * Default dayjs formats for MUI X `LocalizationProvider` so pickers match lists/receipts
 * ({@link APP_DISPLAY_DATE} = day–abbrev–month–year, e.g. 23-Apr-2026).
 */
export const MUI_ADAPTER_DATE_FORMATS: Partial<AdapterFormats> = {
  keyboardDate: APP_DISPLAY_DATE,
  shortDate: APP_DISPLAY_DATE,
  normalDate: APP_DISPLAY_DATE,
  normalDateWithWeekday: DatePattern.DISPLAY_DOW_DD_MMM_YY,
  fullDate: APP_DISPLAY_DATE,
};

export type DateInput = string | number | Date | Dayjs | null | undefined;

export type FormatDateOptions = {
  /** Interpret / format in UTC (for calendar dates stored at midnight UTC, etc.) */
  utc?: boolean;
  /** Returned when input is missing or cannot be parsed */
  empty?: string;
};

export function parseDayjs(input: DateInput, utc = false): Dayjs {
  if (input === null || input === undefined || input === "") return dayjs("");
  const base = dayjs.isDayjs(input) ? input : dayjs(input as string | number | Date);
  if (!base.isValid()) return base;
  return utc ? dayjs.utc(base.valueOf()) : base;
}

export function formatWithPattern(
  input: DateInput,
  pattern: string,
  options?: FormatDateOptions
): string {
  const empty = options?.empty ?? "";
  const d = parseDayjs(input, options?.utc ?? false);
  if (!d.isValid()) return empty;
  return d.format(pattern);
}

const tzOffsetMs = (value: Date): number => value.getTimezoneOffset() * 60000;

/**
 * Receipt / print flows that historically adjusted for `Date` timezone storage.
 * Prefer {@link formatWithPattern} for normal calendar dates.
 */
export function formatReceiptStoredDateTime(value: string | number | Date): string {
  const dateTime = new Date(value);
  const utcFromLocal = new Date(dateTime.getTime() - tzOffsetMs(dateTime));
  const d = dayjs(utcFromLocal);
  return `${d.format(APP_DISPLAY_DATE)} ${d.format("HH:mm")}`;
}

export function formatReceiptStoredDdMmYyyy(value: string | number | Date): string {
  const dateTime = new Date(value);
  const utcFromLocal = new Date(dateTime.getTime() + tzOffsetMs(dateTime));
  return dayjs(utcFromLocal).format(APP_DISPLAY_DATE);
}

export const formatIsoDate = (input: DateInput, options?: FormatDateOptions): string =>
  formatWithPattern(input, DatePattern.ISO_DATE, options);

export const formatIsoMonth = (input: DateInput, options?: FormatDateOptions): string =>
  formatWithPattern(input, DatePattern.ISO_MONTH, options);

/** User-visible calendar day in {@link APP_DISPLAY_DATE} (optionally UTC via `options.utc`). */
export const formatListDate = (input: DateInput, options?: FormatDateOptions): string =>
  formatWithPattern(input, APP_DISPLAY_DATE, options);

export type FormatDateTimeOptions = FormatDateOptions & {
  /** Include seconds in the time segment (default: false → `HH:mm`). */
  includeSeconds?: boolean;
};

/** `DD-MMM-YYYY HH:mm` for timestamps (replaces `DateField` with `showTime`). */
export function formatDisplayDateTime(input: DateInput, options?: FormatDateTimeOptions): string {
  const { includeSeconds = false, ...rest } = options ?? {};
  const empty = rest.empty ?? "—";
  const d = parseDayjs(input, rest.utc ?? false);
  if (!d.isValid()) return empty;
  return `${d.format(APP_DISPLAY_DATE)} ${d.format(includeSeconds ? "HH:mm:ss" : "HH:mm")}`;
}

export const formatWeekdayFull = (input: DateInput, options?: FormatDateOptions): string =>
  formatWithPattern(input, DatePattern.WEEKDAY_FULL, options);

export const formatWeekdayFullUtc = (input: DateInput, options?: FormatDateOptions): string =>
  formatWithPattern(input, DatePattern.WEEKDAY_FULL, { ...options, utc: true });

export const formatWeekdayShort = (input: DateInput, options?: FormatDateOptions): string =>
  formatWithPattern(input, DatePattern.WEEKDAY_SHORT, options);

export const formatTime24Utc = (input: DateInput, options?: FormatDateOptions): string =>
  formatWithPattern(input, DatePattern.TIME_24, { ...options, utc: true });

export const formatTime12 = (input: DateInput, options?: FormatDateOptions): string =>
  formatWithPattern(input, DatePattern.TIME_12, options);

export const formatTime12Compact = (input: DateInput, options?: FormatDateOptions): string =>
  formatWithPattern(input, DatePattern.TIME_12_COMPACT, options);

export const formatHour12TightToday = (hour24: number, options?: FormatDateOptions): string =>
  formatWithPattern(
    dayjs().hour(hour24).minute(0).second(0).millisecond(0),
    DatePattern.HOUR_12_TIGHT,
    options
  );

export const formatExportFilenameTimestamp = (): string => dayjs().format(DatePattern.EXPORT_STAMP);

export const formatEventCardDateRange = (
  from: DateInput,
  to: DateInput,
  options?: FormatDateOptions
): string =>
  `${formatWithPattern(from, APP_DISPLAY_DATE, options)} - ${formatWithPattern(
    to,
    APP_DISPLAY_DATE,
    options
  )}`;

/** `HH:mm` wall clock parsed strictly from 24h text */
export function formatMajlisStartTimeLabel(hhmm: string | null | undefined): string {
  if (hhmm == null || String(hhmm).trim() === "") return "—";
  const d = dayjs(String(hhmm).trim(), "HH:mm", true);
  return d.isValid() ? d.format(DatePattern.TIME_12) : String(hhmm);
}
