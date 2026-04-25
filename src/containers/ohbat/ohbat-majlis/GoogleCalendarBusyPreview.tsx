import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Calendar, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseIcon from "@mui/icons-material/Close";
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import { callApi } from "@/dataprovider/misc-apis";
import { reactBigCalendarWrapperSx } from "@/theme/reactBigCalendarThemeSx";
import dayjsLocalizer from "@/utils/dayjs-localizer";

dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);

const localizer = dayjsLocalizer;

type ApiEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
};

type RbcEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
};

function parseApiResponse(data: unknown): { configured: boolean; events: ApiEvent[] } {
  if (!data || typeof data !== "object") {
    return { configured: false, events: [] };
  }
  const d = data as Record<string, unknown>;
  const configured = Boolean(d.configured);
  const raw = Array.isArray(d.events) ? d.events : [];
  const events: ApiEvent[] = [];
  for (const it of raw) {
    if (!it || typeof it !== "object") {
      continue;
    }
    const o = it as Record<string, unknown>;
    if (typeof o.id !== "string") {
      continue;
    }
    events.push({
      id: o.id,
      summary: typeof o.summary === "string" ? o.summary : "",
      start: typeof o.start === "string" ? o.start : "",
      end: typeof o.end === "string" ? o.end : "",
      allDay: Boolean(o.allDay),
    });
  }
  return { configured, events };
}

function mapToRbc(e: ApiEvent): RbcEvent | null {
  if (!e.start || !e.end) {
    return null;
  }
  const start = new Date(e.start);
  const end = new Date(e.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  return { id: e.id, title: e.summary, start, end, allDay: e.allDay };
}

function dayFromFormValue(formDate: unknown): Dayjs | null {
  if (formDate == null || formDate === "") {
    return null;
  }
  if (formDate instanceof Date) {
    const d = dayjs(formDate);
    return d.isValid() ? d : null;
  }
  const s = String(formDate).trim().slice(0, 10);
  const d = dayjs(s, "YYYY-MM-DD", true);
  return d.isValid() ? d : null;
}

/** ISO week length for agenda “schedule” range (Mon–Sun) and API queries. */
const SCHEDULE_RANGE_DAYS = 7;

/**
 * Read-only schedule (agenda) list of the tenant’s linked Google Calendar while creating/editing ohbat majlis.
 */
export function GoogleCalendarBusyPreview() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { control } = useFormContext();
  const formDate = useWatch({ control, name: "date" });
  const [weekCursor, setWeekCursor] = useState<Dayjs>(() => dayjs().startOf("isoWeek"));
  const [events, setEvents] = useState<RbcEvent[]>([]);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const picked = dayFromFormValue(formDate);
    if (picked) {
      setWeekCursor(picked.startOf("isoWeek"));
    }
  }, [formDate]);

  const range = useMemo(() => {
    const start = weekCursor.startOf("isoWeek").format("YYYY-MM-DD");
    const end = weekCursor
      .startOf("isoWeek")
      .add(SCHEDULE_RANGE_DAYS - 1, "day")
      .format("YYYY-MM-DD");
    return { start, end };
  }, [weekCursor]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await callApi({
        location: "ohbatMajalis",
        method: "GET",
        id: "google-calendar/events",
        data: { start: range.start, end: range.end },
      });
      const parsed = parseApiResponse(data);
      setConfigured(parsed.configured);
      setEvents(parsed.events.map(mapToRbc).filter((x): x is RbcEvent => x != null));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load Google Calendar");
    } finally {
      setLoading(false);
    }
  }, [range.end, range.start]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const t = setTimeout(() => {
      void load();
    }, 300);
    return () => clearTimeout(t);
  }, [load, open]);

  const eventPropGetter = useCallback(
    () => ({
      style: {
        backgroundColor: alpha(theme.palette.primary.main, 0.28),
        borderColor: alpha(theme.palette.primary.main, 0.65),
        color: theme.palette.text.primary,
        fontSize: "0.75rem",
        cursor: "default",
      },
    }),
    [theme]
  );

  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1 }}>
        Linked Google Calendar (read-only)
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => setOpen(true)}
        fullWidth={isMobile}
        sx={{ alignSelf: "flex-start" }}
      >
        Open Google Calendar Preview
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        fullScreen={isMobile}
        maxWidth={false}
        PaperProps={{
          sx: isMobile
            ? undefined
            : {
                width: "96vw",
                maxWidth: "96vw",
                height: "90vh",
              },
        }}
      >
        <DialogTitle sx={{ pr: 6 }}>
          Linked Google Calendar (read-only)
          <IconButton
            aria-label="Close Google Calendar preview"
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          {error ? (
            <Alert severity="warning" sx={{ mb: 1 }}>
              {error}
            </Alert>
          ) : null}
          {configured === false ? (
            <Alert severity="info" sx={{ mb: 1 }}>
              Google Calendar is not linked for this tenant (no <code>googleCalendarId</code> on the
              tenant record).
            </Alert>
          ) : null}
          {configured !== false ? (
            <Box sx={{ position: "relative" }}>
              {loading ? (
                <LinearProgress
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 2,
                    borderRadius: 1,
                  }}
                />
              ) : null}
              <Box
                sx={(t) => ({
                  ...reactBigCalendarWrapperSx(t),
                  height: isMobile ? "calc(100vh - 220px)" : "calc(90vh - 170px)",
                  minHeight: isMobile ? 360 : 480,
                  "& .rbc-calendar": { minHeight: isMobile ? 320 : 440 },
                  ...(t.palette.mode === "dark"
                    ? {
                        "& .rbc-agenda-table": {
                          borderColor: t.palette.divider,
                        },
                        "& .rbc-agenda-table tbody > tr > td + td": {
                          borderLeftColor: t.palette.divider,
                        },
                        "& .rbc-agenda-table tbody > tr + tr": {
                          borderTopColor: t.palette.divider,
                        },
                        "& .rbc-agenda-table thead > tr > th": {
                          borderBottomColor: t.palette.divider,
                        },
                      }
                    : {}),
                })}
              >
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  titleAccessor="title"
                  view={Views.AGENDA}
                  views={[Views.AGENDA]}
                  date={weekCursor.toDate()}
                  length={SCHEDULE_RANGE_DAYS}
                  messages={{ agenda: "Schedule" }}
                  onNavigate={(d: Date) => {
                    setWeekCursor(dayjs(d).startOf("isoWeek"));
                  }}
                  selectable={false}
                  style={{ height: "100%", width: "100%" }}
                  eventPropGetter={eventPropGetter}
                />
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
