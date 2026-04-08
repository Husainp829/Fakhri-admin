import { useCallback, useEffect, useState } from "react";
import { useDataProvider, useNotify } from "react-admin";
import { Views, type View } from "react-big-calendar";
import dayjs, { type Dayjs } from "dayjs";
import "@/utils/dayjs-localizer";
import { slotTimeRanges } from "@/constants";
import type { HallBookingCalendarEvent, HallBookingResource } from "./types";
import { slotLabel } from "./hallCalendarFormat";

export function useHallBookingsCalendarEvents(view: View, date: Dayjs) {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [events, setEvents] = useState<HallBookingCalendarEvent[]>([]);

  const fetchHallBookings = useCallback(
    async (start: Date, end: Date) => {
      const { data } = await dataProvider.getList("hallBookings", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "date", order: "ASC" },
        filter: {
          start: dayjs(start).format("YYYY-MM-DD"),
          end: dayjs(end).format("YYYY-MM-DD"),
          includeBlockedDates: true,
        },
      });
      return data as unknown[];
    },
    [dataProvider]
  );

  const loadEvents = useCallback(async () => {
    let rangeStart: Dayjs;
    let rangeEnd: Dayjs;

    if (view === Views.MONTH) {
      rangeStart = dayjs(date).startOf("month");
      rangeEnd = dayjs(date).endOf("month");
    } else if (view === Views.WEEK) {
      rangeStart = dayjs(date).startOf("week");
      rangeEnd = dayjs(date).endOf("week");
    } else {
      rangeStart = dayjs(date).startOf("day");
      rangeEnd = dayjs(date).endOf("day");
    }

    try {
      const bookings = await fetchHallBookings(rangeStart.toDate(), rangeEnd.toDate());

      const formatted: HallBookingCalendarEvent[] = (bookings as Record<string, unknown>[]).map(
        (book) => {
          const slotKey = String(book.slot ?? "");
          const [startHour, endHour] = slotTimeRanges[slotKey] ?? [0, 1];
          const hall = book.hall as
            | { id?: string; name?: string; shortCode?: string; color?: string | null }
            | undefined;
          const booking = book.booking as
            | {
                paidAmount?: number;
                depositPaidAmount?: number;
                organiser?: string;
                itsNo?: string;
                phone?: string;
              }
            | undefined;

          if (book.isBlockedDate) {
            return {
              id: book.id as string | number,
              title: `${hall?.name || "N/A"}`,
              subTitle: `${slotLabel(String(book.slot ?? ""))}`,
              start: dayjs(book.date as string, "YYYY-MM-DD")
                .hour(startHour)
                .minute(0)
                .second(0)
                .toDate(),
              end: dayjs(book.date as string, "YYYY-MM-DD")
                .hour(endHour)
                .minute(0)
                .second(0)
                .toDate(),
              isBlockedDate: true,
              purpose: book.purpose as string | undefined,
              resource: {
                hall,
                purpose: book.purpose as string | undefined,
                isBlockedDate: true,
              },
            };
          }
          return {
            id: book.id as string | number,
            title: `${hall?.name || "N/A"}`,
            subTitle: `${slotLabel(String(book.slot ?? ""))}`,
            start: dayjs(book.date as string, "YYYY-MM-DD")
              .hour(startHour)
              .minute(0)
              .second(0)
              .toDate(),
            end: dayjs(book.date as string, "YYYY-MM-DD")
              .hour(endHour)
              .minute(0)
              .second(0)
              .toDate(),
            tentative: !((booking?.paidAmount ?? 0) + (booking?.depositPaidAmount ?? 0) > 0),
            resource: book as unknown as HallBookingResource,
          };
        }
      );

      setEvents(formatted);
    } catch {
      notify("Error fetching hall bookings", { type: "warning" });
    }
  }, [view, date, fetchHallBookings, notify]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadEvents();
    }, 500);

    return () => clearTimeout(timeout);
  }, [loadEvents]);

  return events;
}
