import { useEffect, useState } from "react";
import { useDataProvider, useNotify, useRedirect, useSidebarState } from "react-admin";
import type { RaRecord } from "react-admin";
import { Calendar, Views, type ToolbarProps } from "react-big-calendar";
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
import startCase from "lodash/startCase";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs, { type Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjsLocalizer from "@/utils/dayjs-localizer";
import CustomCalendarToolbar from "@/components/CustomCalendarToolbar";
import { buildOhbatMajlisEventDetailsText } from "../OhbatMajlisEventDetailsClipboard";
import { formatMajlisStartTimeLabel } from "../OhbatMajlisTime";
import { useBaseRoute } from "@/utils/route-utility";
import { fromGregorian } from "@/utils/hijri-date-utils";
import { OhbatMajlisViewToggle } from "./OhbatMajlisViewToggle";
import { majlisHasSadarat, missingSadaratBorderLeft } from "./MissingSadaratHighlight";

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

const ohbatTypeColors: Record<string, string> = {
  Jaman: "#2e7d32",
  Food_packets: "#1565c0",
  Salawaat: "#6a1b9a",
};

function sadaratDisplayName(s: { name?: string; itsNo?: string } | null | undefined): string {
  if (!s) return "";
  const n = s.name?.trim();
  if (n) return n;
  const its = s.itsNo?.trim();
  if (its) return its;
  return "";
}

type CalendarEventItem = {
  id: string | number;
  title: string;
  subTitle: string;
  start: Date;
  end: Date;
  resource: RaRecord;
};

function CustomEventComponent({ event }: { event: CalendarEventItem }) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const row = event.resource;
  const missingSadarat = row && !majlisHasSadarat(row);
  const sadarat = row?.sadarat as { name?: string; itsNo?: string; mobile?: string } | undefined;
  const sadaratName = !missingSadarat ? sadaratDisplayName(sadarat) : "";
  const sadaratMobile = sadarat?.mobile?.trim();
  const captionSx = { fontSize: isMobile ? "3vw" : "10px" };
  const secondarySx = {
    mt: 0.25,
    fontSize: isMobile ? "2.6vw" : "9px",
    lineHeight: 1.25,
    opacity: 0.95,
    wordBreak: "break-word" as const,
  };

  return (
    <div style={{ color: "white", padding: 0 }}>
      <Typography variant="caption" display="block" sx={captionSx}>
        {dayjs(event.start).format("h:mm A")} – {dayjs(event.end).format("h:mm A")}
        <br />
        {event.title}
        <br />
        {event.subTitle}
        {sadaratName && (
          <>
            <br />
            <Box component="span" sx={secondarySx}>
              Sadarat: {sadaratName}
              {sadaratMobile ? ` · ${sadaratMobile}` : ""}
            </Box>
          </>
        )}
        {missingSadarat && (
          <>
            <br />
            <Box
              component="span"
              sx={{
                ...secondarySx,
                fontStyle: "italic",
                opacity: 0.92,
              }}
            >
              No sadarat
            </Box>
          </>
        )}
      </Typography>
    </div>
  );
}

function MonthDateHeader({ date, onDrillDown }: { date: Date; onDrillDown: () => void }) {
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
}

const localizer = dayjsLocalizer;

function LabelValue({ label, value, grid }: { label: string; value: string; grid?: number }) {
  return (
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
}

export function OhbatMajlisCalenderView() {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [sidebarOpen] = useSidebarState();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialView = searchParams.get("view") || Views.MONTH;
  const dateParam = searchParams.get("date");
  const initialDate = dateParam && dayjs(dateParam).isValid() ? dayjs(dateParam) : dayjs();

  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [view, setView] = useState(initialView);
  const [date, setDate] = useState<Dayjs>(initialDate);
  const [selectedEvent, setSelectedEvent] = useState<RaRecord | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSelectEvent = (event: CalendarEventItem) => {
    if (event?.resource) {
      setSelectedEvent(event.resource);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const fetchMajlis = async (start: Date, end: Date) => {
    const { data } = await dataProvider.getList("ohbatMajalis", {
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "date", order: "ASC" },
      filter: {
        start: dayjs(start).format("YYYY-MM-DD"),
        end: dayjs(end).format("YYYY-MM-DD"),
      },
    });
    return data as RaRecord[];
  };

  const loadEvents = async () => {
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

      const formatted: CalendarEventItem[] = rows.map((row) => {
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
  };

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadEvents();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mirror legacy: reload when view/date changes only
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
        onView={(v: string) => setView(v)}
        onNavigate={(val: Date) => setDate(dayjs(val))}
        onSelectEvent={(ev: CalendarEventItem) => handleSelectEvent(ev)}
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
              listToggleComponent={OhbatMajlisViewToggle}
            />
          ),
          month: {
            dateHeader: MonthDateHeader,
          },
          week: { header: MonthDateHeader },
        }}
        eventPropGetter={(event: CalendarEventItem) => {
          const row = event?.resource;
          const missingSadarat = row && !majlisHasSadarat(row);
          return {
            style: {
              backgroundColor: ohbatTypeColors[String(row?.type)] || "#546e7a",
              color: "white",
              ...(missingSadarat ? { borderLeft: missingSadaratBorderLeft } : {}),
            },
          };
        }}
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
                <LabelValue label="Host ITS" value={String(selectedEvent?.hostItsNo ?? "—")} />
                <LabelValue label="Host name" value={String(selectedEvent?.hostName ?? "—")} />
                <LabelValue label="Sector" value={String(selectedEvent?.hostSector ?? "—")} />
                <LabelValue
                  label="Sub-sector"
                  value={String(selectedEvent?.hostSubSector ?? "—")}
                />
                <LabelValue label="Contact mobile" value={String(selectedEvent?.mobileNo ?? "—")} />
                <LabelValue label="Type" value={String(selectedEvent?.type ?? "—")} />
                <LabelValue
                  label="Time"
                  value={formatMajlisStartTimeLabel(selectedEvent?.startTime as string | undefined)}
                />
                <LabelValue
                  label="Date"
                  value={dayjs(selectedEvent.date as string).format("YYYY-MM-DD")}
                />
                <LabelValue
                  label="Venue address"
                  value={String(selectedEvent?.address ?? "—")}
                  grid={12}
                />
                <LabelValue
                  label="Sadarat"
                  value={String(
                    (selectedEvent?.sadarat as { name?: string } | undefined)?.name ?? "—"
                  )}
                />
                <LabelValue
                  label="Sadarat mobile"
                  value={String(
                    (selectedEvent?.sadarat as { mobile?: string } | undefined)?.mobile ?? "—"
                  )}
                />
                <LabelValue
                  label="Khidmatguzar name"
                  value={String(
                    (selectedEvent?.khidmatguzar as { Full_Name?: string } | undefined)
                      ?.Full_Name ?? "—"
                  )}
                />
                <LabelValue
                  label="Khidmatguzar mobile"
                  value={String(
                    (selectedEvent?.khidmatguzar as { Mobile?: string } | undefined)?.Mobile ?? "—"
                  )}
                />
                <LabelValue
                  label="Zakereen name"
                  value={String(
                    (selectedEvent?.zakereen as { Full_Name?: string } | undefined)?.Full_Name ??
                      "—"
                  )}
                />
                <LabelValue
                  label="Zakereen mobile"
                  value={String(
                    (selectedEvent?.zakereen as { Mobile?: string } | undefined)?.Mobile ?? "—"
                  )}
                />
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ gap: 1, flexWrap: "wrap" }}>
          <Button
            onClick={async () => {
              if (!selectedEvent) return;
              try {
                await navigator.clipboard.writeText(
                  buildOhbatMajlisEventDetailsText(selectedEvent)
                );
                notify("Event details copied to clipboard", { type: "success" });
              } catch {
                notify("Could not copy to clipboard", { type: "error" });
              }
            }}
            variant="outlined"
          >
            Copy details
          </Button>
          <Button
            onClick={() => {
              if (selectedEvent?.id == null) return;
              redirect("show", "ohbatMajalis", selectedEvent.id);
              handleCloseModal();
            }}
            variant="outlined"
          >
            Show
          </Button>
          <Button
            onClick={() => {
              if (selectedEvent?.id == null) return;
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
}

export default OhbatMajlisCalenderView;
