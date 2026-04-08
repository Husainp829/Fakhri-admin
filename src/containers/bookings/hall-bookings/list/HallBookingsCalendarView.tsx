import { useEffect, useState } from "react";
import { useSidebarState } from "react-admin";
import {
  Calendar,
  Views,
  type View,
  type ToolbarProps,
  type EventPropGetter,
} from "react-big-calendar";
import { useSearchParams } from "react-router-dom";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs, { type Dayjs } from "dayjs";
import dayjsLocalizer from "@/utils/dayjs-localizer";
import { useBaseRoute } from "@/utils/route-utility";
import { reactBigCalendarWrapperSx } from "@/theme/reactBigCalendarThemeSx";
import { hallBookingEventShellStyle } from "./hall-calendar/hallCalendarColors";
import { HallBookingsCalendarToolbarWithLegend } from "./hall-calendar/HallBookingsCalendarToolbarWithLegend";
import { HallBookingCalendarEventComponent } from "./hall-calendar/HallBookingCalendarEventComponent";
import { HallBookingMonthDateHeader } from "./hall-calendar/HallBookingMonthDateHeader";
import { HallBookingDetailsDialog } from "./hall-calendar/HallBookingDetailsDialog";
import { useHallBookingsCalendarEvents } from "./hall-calendar/useHallBookingsCalendarEvents";
import type { HallBookingCalendarEvent, HallBookingResource } from "./hall-calendar/types";

const localizer = dayjsLocalizer;

const VIEW_KEYS = new Set<string>(["day", "week", "month"]);

export const HallBookingsCalendarView = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [sidebarOpen] = useSidebarState();

  const [searchParams, setSearchParams] = useSearchParams();

  const viewFromUrl = searchParams.get("view");
  const initialView: View =
    viewFromUrl && VIEW_KEYS.has(viewFromUrl)
      ? (viewFromUrl as View)
      : isMobile
        ? Views.DAY
        : Views.MONTH;

  const dateParam = searchParams.get("date");
  const initialDate = dateParam && dayjs(dateParam).isValid() ? dayjs(dateParam) : dayjs();

  const [view, setView] = useState<View>(initialView);
  const [date, setDate] = useState<Dayjs>(initialDate);
  const [selectedEvent, setSelectedEvent] = useState<HallBookingResource | null>(null);
  const [showModal, setShowModal] = useState(false);

  const events = useHallBookingsCalendarEvents(view, date);

  const baseRoute = useBaseRoute();

  useEffect(() => {
    if (baseRoute === "bookings") {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("view", String(view));
      newParams.set("date", date.format("YYYY-MM-DD"));
      setSearchParams(newParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync URL; avoid loop on searchParams
  }, [view, date, setSearchParams, baseRoute]);

  const handleSelectEvent = (event: HallBookingCalendarEvent) => {
    if (event?.resource && !event?.isBlockedDate) {
      setSelectedEvent(event.resource);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const calendarShellSx = {
    display: "flex",
    flexDirection: "column" as const,
    flex: 1,
    minHeight: 0,
    width: isMobile ? "95vw" : sidebarOpen ? "calc(100vw - 255px)" : "calc(100vw - 65px)",
    height: isMobile ? "100dvh" : "calc(100vh - 8vh)",
    maxWidth: "100%",
  };

  return (
    <Box
      sx={(theme) => ({
        ...reactBigCalendarWrapperSx(theme),
        ...calendarShellSx,
      })}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          views={["day", "week", "month"]}
          onView={(v: View) => setView(v)}
          onNavigate={(val: Date) => setDate(dayjs(val))}
          onSelectEvent={(e: HallBookingCalendarEvent) => handleSelectEvent(e)}
          style={{ height: "100%", width: "100%" }}
          tooltipAccessor={null}
          date={date.toDate()}
          components={{
            event: HallBookingCalendarEventComponent,
            toolbar: (toolbarProps: ToolbarProps) => (
              <HallBookingsCalendarToolbarWithLegend
                {...toolbarProps}
                events={events}
                selectedDate={date}
                setSelectedDate={setDate}
              />
            ),
            month: { dateHeader: HallBookingMonthDateHeader },
            week: { header: HallBookingMonthDateHeader },
          }}
          eventPropGetter={
            ((event: HallBookingCalendarEvent) => ({
              style: hallBookingEventShellStyle(muiTheme, event),
            })) as EventPropGetter<HallBookingCalendarEvent>
          }
        />
      </Box>

      <HallBookingDetailsDialog
        open={showModal}
        onClose={handleCloseModal}
        selectedEvent={selectedEvent}
      />
    </Box>
  );
};

export default HallBookingsCalendarView;
