import { useEffect, useState } from "react";
import { useSidebarState, type RaRecord } from "react-admin";
import { Calendar, Views, type ToolbarProps, type EventPropGetter } from "react-big-calendar";
import { useSearchParams } from "react-router-dom";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs, { type Dayjs } from "dayjs";
import dayjsLocalizer from "@/utils/dayjs-localizer";
import { useBaseRoute } from "@/utils/route-utility";
import { OhbatMajlisViewToggle } from "./OhbatMajlisViewToggle";
import { reactBigCalendarWrapperSx } from "@/theme/reactBigCalendarThemeSx";
import { majlisCalendarEventStyle } from "./majlis-calendar/majlisCalendarEventStyle";
import { OhbatMajlisCalendarToolbarWithLegend } from "./majlis-calendar/OhbatMajlisCalendarToolbarWithLegend";
import { OhbatMajlisCalendarEventComponent } from "./majlis-calendar/OhbatMajlisCalendarEventComponent";
import { OhbatMajlisMonthDateHeader } from "./majlis-calendar/OhbatMajlisMonthDateHeader";
import { OhbatMajlisDetailsDialog } from "./majlis-calendar/OhbatMajlisDetailsDialog";
import { useOhbatMajlisCalendarEvents } from "./majlis-calendar/useOhbatMajlisCalendarEvents";
import type { OhbatMajlisCalendarEvent } from "./majlis-calendar/types";

const localizer = dayjsLocalizer;

export function OhbatMajlisCalenderView() {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [sidebarOpen] = useSidebarState();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialView = searchParams.get("view") || Views.MONTH;
  const dateParam = searchParams.get("date");
  const initialDate = dateParam && dayjs(dateParam).isValid() ? dayjs(dateParam) : dayjs();

  const [view, setView] = useState(initialView);
  const [date, setDate] = useState<Dayjs>(initialDate);
  const [selectedEvent, setSelectedEvent] = useState<RaRecord | null>(null);
  const [showModal, setShowModal] = useState(false);

  const events = useOhbatMajlisCalendarEvents(view, date);

  const baseRoute = useBaseRoute();

  useEffect(() => {
    if (baseRoute === "ohbat") {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("view", view);
        newParams.set("date", date.format("YYYY-MM-DD"));
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
          onView={(v: string) => setView(v)}
          onNavigate={(val: Date) => setDate(dayjs(val))}
          onSelectEvent={(ev: OhbatMajlisCalendarEvent) => handleSelectEvent(ev)}
          style={{ height: "100%", width: "100%" }}
          tooltipAccessor={null}
          date={date.toDate()}
          components={{
            event: OhbatMajlisCalendarEventComponent,
            toolbar: (toolbarProps: ToolbarProps) => (
              <OhbatMajlisCalendarToolbarWithLegend
                {...toolbarProps}
                events={events}
                selectedDate={date}
                setSelectedDate={setDate}
                listToggleComponent={OhbatMajlisViewToggle}
              />
            ),
            month: { dateHeader: OhbatMajlisMonthDateHeader },
            week: { header: OhbatMajlisMonthDateHeader },
          }}
          eventPropGetter={
            ((event: OhbatMajlisCalendarEvent) => ({
              style: majlisCalendarEventStyle(muiTheme, event),
            })) as EventPropGetter<OhbatMajlisCalendarEvent>
          }
        />
      </Box>

      <OhbatMajlisDetailsDialog
        open={showModal}
        onClose={handleCloseModal}
        selectedEvent={selectedEvent}
      />
    </Box>
  );
}

export default OhbatMajlisCalenderView;
