import { useCallback, useEffect, useState } from "react";
import { useDataProvider, useNotify } from "react-admin";
import type { RaRecord } from "react-admin";
import { Views } from "react-big-calendar";
import dayjs, { type Dayjs } from "dayjs";
import "@/utils/dayjs-localizer";
import startCase from "lodash/startCase";
import { formatMajlisStartTimeLabel } from "../../OhbatMajlisTime";
import type { OhbatMajlisCalendarEvent } from "./types";

export function useOhbatMajlisCalendarEvents(view: string, date: Dayjs) {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [events, setEvents] = useState<OhbatMajlisCalendarEvent[]>([]);

  const fetchMajlis = useCallback(
    async (start: Date, end: Date) => {
      const { data } = await dataProvider.getList("ohbatMajalis", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "date", order: "ASC" },
        filter: {
          start: dayjs(start).format("YYYY-MM-DD"),
          end: dayjs(end).format("YYYY-MM-DD"),
        },
      });
      return data as RaRecord[];
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
      const rows = await fetchMajlis(rangeStart.toDate(), rangeEnd.toDate());

      const formatted: OhbatMajlisCalendarEvent[] = rows.map((row) => {
        const d = dayjs(row.date as string).format("YYYY-MM-DD");
        const raw = (row.startTime as string) || "09:00";
        const [hStr, mStr] = raw.split(":");
        const startH = Number(hStr);
        const startM = Number(mStr);
        const start = dayjs(d, "YYYY-MM-DD")
          .hour(Number.isFinite(startH) ? startH : 9)
          .minute(Number.isFinite(startM) ? startM : 0)
          .second(0)
          .toDate();
        const end = dayjs(start).add(1, "hour").toDate();
        const sadarat = row.sadarat as { name?: string } | undefined;
        return {
          id: row.id,
          title:
            (row.hostName as string) ||
            sadarat?.name ||
            (row.hostItsNo as string) ||
            "Ohbat majlis",
          subTitle: `${startCase(String(row.type))} · ${formatMajlisStartTimeLabel(raw)}`,
          start,
          end,
          resource: row,
        };
      });

      setEvents(formatted);
    } catch {
      notify("Error loading ohbat majlis", { type: "warning" });
    }
  }, [view, date, fetchMajlis, notify]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadEvents();
    }, 300);
    return () => clearTimeout(timeout);
  }, [loadEvents]);

  return events;
}
