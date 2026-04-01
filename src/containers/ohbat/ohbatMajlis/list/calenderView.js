import React, { useEffect, useState } from "react";
import { useDataProvider, useNotify, useRedirect, useSidebarState } from "react-admin";
import { Calendar, Views } from "react-big-calendar";
import { useSearchParams } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  capitalize,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjsLocalizer from "../../../../utils/dayjsLocalizer";
import CustomCalendarToolbar from "../../../../components/CustomCalenderToolbar";
import { slotTimeRanges } from "../../../../constants";
import { useBaseRoute } from "../../../../utils/routeUtility";
import { fromGregorian } from "../../../../utils/hijriDateUtils";
import ViewToggle from "./viewToggle";

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

const ohbatTypeColors = {
  Jaman: "#2e7d32",
  Food_packets: "#1565c0",
  Salawaat: "#6a1b9a",
};

const CustomEventComponent = ({ event }) => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  return (
    <div style={{ color: "white", padding: 0 }}>
      <Typography variant="caption" display="block" sx={{ fontSize: isMobile ? "3vw" : "0.8vw" }}>
        {dayjs(event.start).format("h A")} - {dayjs(event.end).format("h A")}
        <br />
        {event.title}
        <br />
        {event.subTitle}
      </Typography>
    </div>
  );
};

const MonthDateHeader = ({ date, onDrillDown }) => {
  const gregorianDay = dayjs(date).date();
  const hijriDay = fromGregorian(date, "code");
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  return (
    <Button variant="text" size="small" onClick={onDrillDown}>
      <span style={{ fontSize: isMobile ? "0.6rem" : "0.8rem" }}>
        {gregorianDay} | {hijriDay}
      </span>
    </Button>
  );
};

const localizer = dayjsLocalizer;

const LabelValue = ({ label, value, grid }) => (
  <Grid item size={{ xs: 12, md: grid || 6 }}>
    <Typography fontWeight="bold">{label}</Typography>
    <Typography>{value}</Typography>
  </Grid>
);

const CalenderView = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [sidebarOpen] = useSidebarState();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialView = searchParams.get("view") || (isMobile ? Views.DAY : Views.MONTH);
  const initialDate = dayjs(searchParams.get("date"))?.isValid()
    ? dayjs(searchParams.get("date"))
    : dayjs();

  const [events, setEvents] = useState([]);
  const [view, setView] = useState(initialView);
  const [date, setDate] = useState(initialDate);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSelectEvent = (event) => {
    if (event?.resource) {
      setSelectedEvent(event.resource);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const fetchMajlis = async (start, end) => {
    const { data } = await dataProvider.getList("ohbatMajalis", {
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "date", order: "ASC" },
      filter: {
        start: dayjs(start).format("YYYY-MM-DD"),
        end: dayjs(end).format("YYYY-MM-DD"),
      },
    });
    return data;
  };

  const loadEvents = async () => {
    let rangeStart;
    let rangeEnd;

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

      const formatted = rows.map((row) => {
        const [startHour, endHour] = slotTimeRanges[row.slot] || [0, 1];
        const d = dayjs(row.date).format("YYYY-MM-DD");
        return {
          id: row.id,
          title: row.hostName || row.sadarat?.name || row.hostItsNo || "Ohbat majlis",
          subTitle: `${row.type} · ${capitalize(row.slot)}`,
          start: dayjs(d, "YYYY-MM-DD").hour(startHour).minute(0).second(0).toDate(),
          end: dayjs(d, "YYYY-MM-DD").hour(endHour).minute(0).second(0).toDate(),
          resource: row,
        };
      });

      setEvents(formatted);
    } catch (error) {
      notify("Error loading ohbat majlis", { type: "warning" });
    }
  };

  const baseRoute = useBaseRoute();

  useEffect(() => {
    if (baseRoute === "ohbat") {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("view", view);
      newParams.set("date", date.format("YYYY-MM-DD"));
      setSearchParams(newParams);
    }
  }, [view, date, setSearchParams, baseRoute]);

  useEffect(() => {
    const timeout = setTimeout(loadEvents, 300);
    return () => clearTimeout(timeout);
  }, [view, date]);

  const calendarStyle = isMobile
    ? { height: "95vh", width: "95vw" }
    : {
        height: "calc(100vh - 8vh)",
        width: sidebarOpen ? "calc(100vw - 255px)" : "calc(100vw - 65px)",
      };

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        views={["day", "week", "month"]}
        onView={setView}
        onNavigate={(val) => setDate(dayjs(val))}
        onSelectEvent={handleSelectEvent}
        style={calendarStyle}
        tooltipAccessor={null}
        date={date}
        components={{
          event: CustomEventComponent,
          toolbar: (toolbarProps) => (
            <CustomCalendarToolbar
              {...toolbarProps}
              selectedDate={date}
              setSelectedDate={setDate}
              listToggleComponent={ViewToggle}
            />
          ),
          month: {
            dateHeader: MonthDateHeader,
          },
          week: { header: MonthDateHeader },
        }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: ohbatTypeColors[event?.resource?.type] || "#546e7a",
            color: "white",
          },
        })}
      />

      <Dialog open={showModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }} py={1}>
          <Typography variant="h6" alignSelf="center">
            Ohbat Majlis
          </Typography>
          <IconButton aria-label="close" onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Box>
              <Grid container spacing={2}>
                <LabelValue label="Host ITS" value={selectedEvent?.hostItsNo || "—"} />
                <LabelValue label="Host name" value={selectedEvent?.hostName || "—"} />
                <LabelValue label="Sector" value={selectedEvent?.hostSector || "—"} />
                <LabelValue label="Sub-sector" value={selectedEvent?.hostSubSector || "—"} />
                <LabelValue label="Contact mobile" value={selectedEvent?.mobileNo || "—"} />
                <LabelValue label="Type" value={selectedEvent?.type || "—"} />
                <LabelValue label="Slot" value={capitalize(selectedEvent?.slot)} />
                <LabelValue label="Date" value={dayjs(selectedEvent.date).format("YYYY-MM-DD")} />
                <LabelValue label="Venue address" value={selectedEvent?.address || "—"} grid={12} />
                <LabelValue label="Sadarat" value={selectedEvent?.sadarat?.name || "—"} />
                <LabelValue label="Sadarat mobile" value={selectedEvent?.sadarat?.mobile || "—"} />
                <LabelValue
                  label="Khidmatguzar name"
                  value={selectedEvent?.khidmatguzar?.Full_Name || "—"}
                />
                <LabelValue
                  label="Khidmatguzar mobile"
                  value={selectedEvent?.khidmatguzar?.Mobile || "—"}
                />
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ gap: 1, flexWrap: "wrap" }}>
          <Button
            onClick={() => {
              redirect("show", "ohbatMajalis", selectedEvent.id);
              handleCloseModal();
            }}
            variant="outlined"
          >
            Show
          </Button>
          <Button
            onClick={() => {
              redirect("edit", "ohbatMajalis", selectedEvent.id);
              handleCloseModal();
            }}
            variant="contained"
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CalenderView;
