import type { NiyaazPayableEvent } from "@/utils/app-formatters";

/** Event row from `events` list + dashboard cards */
export type EventsListRecord = NiyaazPayableEvent & {
  id: string | number;
  name: string;
  hijriYear?: string | number;
  slug?: string;
  fromDate?: string;
  toDate?: string;
  image?: string | null;
};

/** Stored in react-admin `currentEvent` store (localStorage subset + full record) */
export type CurrentEvent = NiyaazPayableEvent & {
  id?: string | number;
  name?: string;
  slug?: string;
  hijriYear?: string | number;
  image?: string | null;
  fromDate?: string;
  toDate?: string;
};

export type EventStatsNiyaazRow = {
  markaz: string;
  name: string;
  count: number;
  gentsCount: number;
  ladiesCount: number;
  takhmeenAmount: number;
  chairs: number;
  iftaari: number;
  zabihat: number;
  paidAmount: number;
};

export type EventStatsNamaazRow = {
  namaazVenue: string;
  name: string;
  count: number;
  gentsCount: number;
  ladiesCount: number;
};

/** Matches `ReceiptGroupRow` shape used by `receiptGroupBy` */
export type DayWiseReceiptReportRow = {
  markaz: string;
  day: string;
  mode: string;
  totalAmount: number;
};

/** Per markaz: day → payment mode → amount (output shape of `receiptGroupBy`) */
export type ReceiptGroupedMap = Record<string, Record<string, Record<string, number>>>;

export type EventStatsApiPayload = {
  niyaazCounts: EventStatsNiyaazRow[];
  namaazVenueCounts: EventStatsNamaazRow[];
  dayWiseReceiptReport: DayWiseReceiptReportRow[];
};

export function isEventStatsPayload(data: unknown): data is EventStatsApiPayload {
  if (data == null || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    Array.isArray(d.niyaazCounts) &&
    Array.isArray(d.namaazVenueCounts) &&
    Array.isArray(d.dayWiseReceiptReport)
  );
}
