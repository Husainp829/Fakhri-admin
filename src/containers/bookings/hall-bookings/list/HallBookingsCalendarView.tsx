import { useCallback, useEffect, useState } from "react";
import { useDataProvider, useNotify, useRedirect, useSidebarState } from "react-admin";
import {
  Calendar,
  Views,
  type View,
  type ToolbarProps,
  type EventPropGetter,
} from "react-big-calendar";
import { useSearchParams } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Grid";
const slotLabel = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "");
import CloseIcon from "@mui/icons-material/Close";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs, { type Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjsLocalizer from "@/utils/dayjs-localizer";
import CustomCalendarToolbar from "@/components/CustomCalendarToolbar";
import { hallColorMap, slotTimeRanges } from "@/constants";
import { useBaseRoute } from "@/utils/route-utility";
import { fromGregorian } from "@/utils/hijri-date-utils";
import { reactBigCalendarWrapperSx } from "@/theme/reactBigCalendarThemeSx";

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

const localizer = dayjsLocalizer;

type HallBookingCalendarEvent = {
  id: string | number;
  title: string;
  subTitle?: string;
  start: Date;
  end: Date;
  tentative?: boolean;
  isBlockedDate?: boolean;
  purpose?: string;
  resource?: HallBookingResource;
};

type HallBookingResource = {
  id?: string;
  date?: string;
  slot?: string;
  purpose?: string;
  hall?: { name?: string; shortCode?: string };
  booking?: {
    organiser?: string;
    itsNo?: string;
    phone?: string;
    paidAmount?: number;
    depositPaidAmount?: number;
  };
  bookingId?: string;
  isBlockedDate?: boolean;
};

const CustomEventComponent = ({ event }: { event: HallBookingCalendarEvent }) => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  return (
    <div style={{ color: "white", padding: 0 }}>
      <Typography variant="caption" display="block" sx={{ fontSize: isMobile ? "1.5vw" : "0.8vw" }}>
        {dayjs(event.start).format("h A")} - {dayjs(event.end).format("h A")}
        <br />
        {event.title}
        {event.tentative && <div style={{ color: "red" }}>TENTATIVE</div>}
        <br />
        {event.isBlockedDate && event.purpose}
      </Typography>
    </div>
  );
};

const MonthDateHeader = ({ date, onDrillDown }: { date: Date; onDrillDown: () => void }) => {
  const gregorianDay = dayjs(date).date();
  const hijriDay = fromGregorian(date, "code");
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  return (
    <Button variant="text" size="small" onClick={onDrillDown}>
      <Typography
        component="span"
        variant="caption"
        sx={{ fontSize: isMobile ? "0.6rem" : "0.8rem" }}
      >
        {gregorianDay} | {hijriDay}
      </Typography>
    </Button>
  );
};

const LabelValue = ({ label, value, grid }: { label: string; value: string; grid?: number }) => (
  <Grid
    size={{
      xs: 12,
      md: grid ?? 6,
    }}
  >
    <Typography fontWeight="bold">{label}</Typography>
    <Typography>{value}</Typography>
  </Grid>
);

const VIEW_KEYS = new Set<string>(["day", "week", "month"]);

export const HallBookingsCalendarView = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
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

  const [events, setEvents] = useState<HallBookingCalendarEvent[]>([]);
  const [view, setView] = useState<View>(initialView);
  const [date, setDate] = useState<Dayjs>(initialDate);
  const [selectedEvent, setSelectedEvent] = useState<HallBookingResource | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  const fetchHallBookings = async (start: Date, end: Date) => {
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
  };

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
          const hall = book.hall as { name?: string; shortCode?: string } | undefined;
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
  }, [view, date, dataProvider, notify]);

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadEvents();
    }, 500);

    return () => clearTimeout(timeout);
  }, [loadEvents]);

  const calendarStyle = isMobile
    ? { height: "95vh", width: "95vw" }
    : {
        height: "calc(100vh - 8vh)",
        width: sidebarOpen ? "calc(100vw - 255px)" : "calc(100vw - 65px)",
      };

  return (
    <Box sx={(theme) => reactBigCalendarWrapperSx(theme)}>
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
        style={calendarStyle}
        tooltipAccessor={null}
        date={date.toDate()}
        components={{
          event: CustomEventComponent,
          toolbar: (toolbarProps: ToolbarProps) => (
            <CustomCalendarToolbar
              {...toolbarProps}
              selectedDate={date}
              setSelectedDate={setDate}
            />
          ),
          month: {
            dateHeader: MonthDateHeader,
          },
          week: { header: MonthDateHeader },
        }}
        eventPropGetter={
          ((event: HallBookingCalendarEvent) => {
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
                backgroundColor: (hallShortCode && hallColorMap[hallShortCode]) || "grey",
                color: "white",
              },
            };
          }) as EventPropGetter<HallBookingCalendarEvent>
        }
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
                <LabelValue
                  label="Date"
                  value={selectedEvent.date ? dayjs(selectedEvent.date).format("YYYY-MM-DD") : ""}
                />
                <LabelValue label="Slot" value={slotLabel(String(selectedEvent?.slot ?? ""))} />
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (selectedEvent?.bookingId) {
                redirect("show", "bookings", selectedEvent.bookingId);
              }
              handleCloseModal();
            }}
            variant="contained"
          >
            Show Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HallBookingsCalendarView;
