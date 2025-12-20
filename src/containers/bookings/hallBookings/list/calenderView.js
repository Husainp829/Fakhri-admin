/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useDataProvider, useNotify, useRedirect } from "react-admin";
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
import { hallColorMap, slotTimeRanges } from "../../../../constants";
import { useBaseRoute } from "../../../../utils/routeUtility";

// Extend dayjs
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

const CustomEventComponent = ({ event }) => (
  <div style={{ color: "white", padding: 0 }}>
    <Typography variant="caption" display="block">
      {dayjs(event.start).format("MMM D, h A")} - {dayjs(event.end).format("h A")}
    </Typography>
    <Typography variant="caption" strong display="block">
      {event.title}
    </Typography>
    <Typography variant="bold1" strong display="block" sx={{ color: "red" }}>
      {event.tentative ? "TENTATIVE" : ""}
    </Typography>
    {event.isBlockedDate && (
      <Typography variant="caption" strong display="block">
        {event.purpose}
      </Typography>
    )}
  </div>
);

// Custom localizer for react-big-calendar using dayjs
const localizer = dayjsLocalizer;

const LabelValue = ({ label, value, grid }) => (
  <>
    <Grid item size={{ xs: 12, md: grid || 6 }}>
      <Typography fontWeight="bold">{label}</Typography>
      <Typography>{value}</Typography>
    </Grid>
  </>
);

const CalenderView = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();

  const [searchParams, setSearchParams] = useSearchParams();

  // defaults from URL or fallback
  const initialView = searchParams.get("view") || Views.MONTH;
  const initialDate = dayjs(searchParams.get("date"))?.isValid()
    ? dayjs(searchParams.get("date"))
    : dayjs();

  const [events, setEvents] = useState([]);
  const [view, setView] = useState(initialView);
  const [date, setDate] = useState(initialDate);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSelectEvent = (event) => {
    if (event?.resource && !event?.isBlockedDate) {
      setSelectedEvent(event.resource);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const fetchHallBookings = async (start, end) => {
    const { data } = await dataProvider.getList("hallBookings", {
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "date", order: "ASC" },
      filter: {
        start: dayjs(start).format("YYYY-MM-DD"),
        end: dayjs(end).format("YYYY-MM-DD"),
        includeBlockedDates: true,
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
      const bookings = await fetchHallBookings(rangeStart.toDate(), rangeEnd.toDate());

      const formatted = bookings.map((book) => {
        const [startHour, endHour] = slotTimeRanges[book.slot] || [0, 1];
        if (book.isBlockedDate) {
          return {
            id: book.id,
            title: `${book.hall?.name || "N/A"}`,
            subTitle: `${capitalize(book.slot)}`,
            start: dayjs(book.date, "YYYY-MM-DD").hour(startHour).minute(0).second(0).toDate(),
            end: dayjs(book.date, "YYYY-MM-DD").hour(endHour).minute(0).second(0).toDate(),
            isBlockedDate: true,
            purpose: book.purpose,
          };
        }
        return {
          id: book.id,
          title: `${book.hall?.name || "N/A"}`,
          subTitle: `${capitalize(book.slot)}`,
          start: dayjs(book.date, "YYYY-MM-DD").hour(startHour).minute(0).second(0).toDate(),
          end: dayjs(book.date, "YYYY-MM-DD").hour(endHour).minute(0).second(0).toDate(),
          tentative: !(book.booking.paidAmount + book.booking.depositPaidAmount > 0),
          resource: book,
        };
      });

      setEvents(formatted);
    } catch (error) {
      notify("Error fetching hall bookings", { type: "warning" });
    }
  };
  const baseRoute = useBaseRoute();

  useEffect(() => {
    if (baseRoute === "bookings") {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("view", view);
      newParams.set("date", date.format("YYYY-MM-DD"));
      setSearchParams(newParams);
    }
  }, [view, date, setSearchParams, baseRoute]);

  useEffect(() => {
    const timeout = setTimeout(loadEvents, 500);

    return () => clearTimeout(timeout);
  }, [view, date]);

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
        style={{ height: "calc(90vh - 35px)" }}
        tooltipAccessor={null}
        date={date}
        components={{
          event: CustomEventComponent,
          toolbar: (toolbarProps) => (
            <CustomCalendarToolbar
              {...toolbarProps}
              selectedDate={date}
              setSelectedDate={setDate}
            />
          ),
        }}
        eventPropGetter={(event) => {
          const hallShortCode = event?.resource?.hall?.shortCode;
          if (event?.isBlockedDate) {
            return {
              style: {
                backgroundColor: "grey",
                color: "white",
              },
            };
          }
          return {
            style: {
              backgroundColor: hallColorMap[hallShortCode] || "grey",
              color: "white",
            },
          };
        }}
      />

      <Dialog open={showModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }} py={1}>
          <Typography variant="h6" alignSelf="center">
            Booking Details
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Box>
              <Grid container spacing={2}>
                <LabelValue
                  label="Organiser"
                  value={selectedEvent?.booking?.organiser || "N/A"}
                  grid={12}
                />
                <LabelValue label="ITS No." value={selectedEvent?.booking?.itsNo || "N/A"} />
                <LabelValue label="phone" value={selectedEvent?.booking?.phone || "N/A"} />
                <LabelValue label="Purpose" value={selectedEvent?.purpose || "N/A"} grid={12} />
                <LabelValue label="Hall" value={selectedEvent?.hall?.name || "N/A"} grid={12} />
                <LabelValue label="Date" value={dayjs(selectedEvent.date).format("YYYY-MM-DD")} />
                <LabelValue label="Slot" value={capitalize(selectedEvent?.slot)} />
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              // eslint-disable-next-line no-console
              redirect("show", "bookings", selectedEvent.bookingId);
              handleCloseModal();
            }}
            variant="contained"
          >
            Show Booking
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CalenderView;
