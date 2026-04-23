import { useEffect, useState } from "react";
import { type RaRecord } from "react-admin";
import { Views, type View, type ToolbarProps, type EventPropGetter } from "react-big-calendar";
import { useSearchParams } from "react-router-dom";
import { useMediaQuery, useTheme } from "@mui/material";
import dayjs, { type Dayjs } from "dayjs";
import { formatIsoDate } from "@/utils/date-format";
import { useBaseRoute } from "@/utils/route-utility";
import { ResourceBigCalendarView } from "@/components/resource-big-calendar/ResourceBigCalendarView";
import { parseCalendarViewFromSearchParam } from "@/components/resource-big-calendar/resourceCalendarTimeGridDefaults";
import { OhbatMajlisViewToggle } from "./OhbatMajlisViewToggle";
import { majlisCalendarEventStyle } from "./majlis-calendar/majlisCalendarEventStyle";
import { OhbatMajlisCalendarToolbarWithLegend } from "./majlis-calendar/OhbatMajlisCalendarToolbarWithLegend";
import { OhbatMajlisCalendarEventComponent } from "./majlis-calendar/OhbatMajlisCalendarEventComponent";
import { OhbatMajlisMonthDateHeader } from "./majlis-calendar/OhbatMajlisMonthDateHeader";
import { OhbatMajlisDetailsDialog } from "./majlis-calendar/OhbatMajlisDetailsDialog";
import { useOhbatMajlisCalendarEvents } from "./majlis-calendar/useOhbatMajlisCalendarEvents";
import type { OhbatMajlisCalendarEvent } from "./majlis-calendar/types";

export function OhbatMajlisCalenderView() {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [searchParams, setSearchParams] = useSearchParams();

  const viewFromUrl = searchParams.get("view");
  const initialView = parseCalendarViewFromSearchParam(viewFromUrl, isMobile);

  const dateParam = searchParams.get("date");
  const initialDate = dateParam && dayjs(dateParam).isValid() ? dayjs(dateParam) : dayjs();

  const [view, setView] = useState<View>(initialView);
  const [date, setDate] = useState<Dayjs>(initialDate);
  const [selectedEvent, setSelectedEvent] = useState<RaRecord | null>(null);
  const [showModal, setShowModal] = useState(false);

  const events = useOhbatMajlisCalendarEvents(view, date);

  const baseRoute = useBaseRoute();

  useEffect(() => {
    if (baseRoute === "ohbat") {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("view", String(view));
        newParams.set("date", formatIsoDate(date));
        return newParams;
      });
    }
  }, [view, date, setSearchParams, baseRoute]);

  const handleSelectEvent = (event: OhbatMajlisCalendarEvent) => {
    if (event?.resource) {
      setSelectedEvent(event.resource);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  return (
    <ResourceBigCalendarView<OhbatMajlisCalendarEvent>
      events={events}
      view={view}
      onViewChange={setView}
      date={date}
      onDateChange={setDate}
      onSelectEvent={handleSelectEvent}
      EventComponent={OhbatMajlisCalendarEventComponent}
      renderToolbar={(toolbarProps: ToolbarProps) => (
        <OhbatMajlisCalendarToolbarWithLegend
          {...toolbarProps}
          events={events}
          selectedDate={date}
          setSelectedDate={setDate}
          listToggleComponent={OhbatMajlisViewToggle}
        />
      )}
      monthDateHeader={OhbatMajlisMonthDateHeader}
      eventPropGetter={
        ((event: OhbatMajlisCalendarEvent) => ({
          style: {
            ...majlisCalendarEventStyle(muiTheme, event),
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
        })) as EventPropGetter<OhbatMajlisCalendarEvent>
      }
    >
      <OhbatMajlisDetailsDialog
        open={showModal}
        onClose={handleCloseModal}
        selectedEvent={selectedEvent}
      />
    </ResourceBigCalendarView>
  );
}

export default OhbatMajlisCalenderView;
