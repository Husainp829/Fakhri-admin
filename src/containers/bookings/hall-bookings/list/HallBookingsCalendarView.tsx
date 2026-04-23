import { useEffect, useState } from "react";
import { Views, type View, type ToolbarProps, type EventPropGetter } from "react-big-calendar";
import { useSearchParams } from "react-router-dom";
import { useMediaQuery, useTheme } from "@mui/material";
import dayjs, { type Dayjs } from "dayjs";
import { formatIsoDate } from "@/utils/date-format";
import { useBaseRoute } from "@/utils/route-utility";
import { ResourceBigCalendarView } from "@/components/resource-big-calendar/ResourceBigCalendarView";
import { parseCalendarViewFromSearchParam } from "@/components/resource-big-calendar/resourceCalendarTimeGridDefaults";
import { hallBookingEventShellStyle } from "./hall-calendar/hallCalendarColors";
import { HallBookingsCalendarToolbarWithLegend } from "./hall-calendar/HallBookingsCalendarToolbarWithLegend";
import { HallBookingCalendarEventComponent } from "./hall-calendar/HallBookingCalendarEventComponent";
import { HallBookingMonthDateHeader } from "./hall-calendar/HallBookingMonthDateHeader";
import { HallBookingDetailsDialog } from "./hall-calendar/HallBookingDetailsDialog";
import { useHallBookingsCalendarEvents } from "./hall-calendar/useHallBookingsCalendarEvents";
import type { HallBookingCalendarEvent, HallBookingResource } from "./hall-calendar/types";

export const HallBookingsCalendarView = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const [searchParams, setSearchParams] = useSearchParams();

  const viewFromUrl = searchParams.get("view");
  const initialView = parseCalendarViewFromSearchParam(viewFromUrl, isMobile);

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
      newParams.set("date", formatIsoDate(date));
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

  return (
    <ResourceBigCalendarView<HallBookingCalendarEvent>
      events={events}
      view={view}
      onViewChange={setView}
      date={date}
      onDateChange={setDate}
      onSelectEvent={handleSelectEvent}
      EventComponent={HallBookingCalendarEventComponent}
      renderToolbar={(toolbarProps: ToolbarProps) => (
        <HallBookingsCalendarToolbarWithLegend
          {...toolbarProps}
          events={events}
          selectedDate={date}
          setSelectedDate={setDate}
        />
      )}
      monthDateHeader={HallBookingMonthDateHeader}
      eventPropGetter={
        ((event: HallBookingCalendarEvent) => ({
          style: {
            ...hallBookingEventShellStyle(muiTheme, event),
            ...(view === Views.MONTH
              ? {
                  padding: "1px 3px",
                  fontSize: "0.7rem",
                  lineHeight: 1.15,
                  minHeight: 0,
                }
              : {
                  padding: "3px 5px",
                  fontSize: "0.75rem",
                  lineHeight: 1.2,
                }),
          },
        })) as EventPropGetter<HallBookingCalendarEvent>
      }
    >
      <HallBookingDetailsDialog
        open={showModal}
        onClose={handleCloseModal}
        selectedEvent={selectedEvent}
      />
    </ResourceBigCalendarView>
  );
};

export default HallBookingsCalendarView;
