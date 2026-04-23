import { useMemo } from "react";
import { Views, type View } from "react-big-calendar";

export const RESOURCE_CALENDAR_VIEW_KEYS = new Set<string>(["day", "week", "month"]);

/** Time-of-day only; merged with each column date by the localizer (react-big-calendar Week/Day). */
export const RESOURCE_DAY_GRID_TIME_BOUNDS = {
  min: new Date(1970, 0, 1, 6, 0, 0),
  max: new Date(1970, 0, 1, 22, 30, 0),
  scrollToTime: new Date(1970, 0, 1, 7, 0, 0),
};

export function useResourceCalendarTimeGridProps(view: View) {
  return useMemo(
    () => ({
      min: RESOURCE_DAY_GRID_TIME_BOUNDS.min,
      max: RESOURCE_DAY_GRID_TIME_BOUNDS.max,
      scrollToTime: RESOURCE_DAY_GRID_TIME_BOUNDS.scrollToTime,
      enableAutoScroll: view === Views.DAY || view === Views.WEEK,
    }),
    [view]
  );
}

export function parseCalendarViewFromSearchParam(raw: string | null, isMobile: boolean): View {
  if (raw && RESOURCE_CALENDAR_VIEW_KEYS.has(raw)) {
    return raw as View;
  }
  return isMobile ? Views.DAY : Views.MONTH;
}
