import { useMemo, type ComponentType, type ReactNode } from "react";
import { useSidebarState } from "react-admin";
import { Calendar, type View, type ToolbarProps, type EventPropGetter } from "react-big-calendar";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs, { type Dayjs } from "dayjs";
import dayjsLocalizer from "@/utils/dayjs-localizer";
import { reactBigCalendarWrapperSx } from "@/theme/reactBigCalendarThemeSx";
import type { SystemStyleObject } from "@mui/system";
import type { Theme } from "@mui/material/styles";
import { ResourceCalendarViewProvider } from "./ResourceCalendarViewContext";
import { resourceBigCalendarDensitySx } from "./resourceBigCalendarDensitySx";
import { resourceCalendarShellSx } from "./resourceCalendarShellSx";
import { useResourceCalendarTimeGridProps } from "./resourceCalendarTimeGridDefaults";

const localizer = dayjsLocalizer;

type DateHeaderProps = { date: Date; onDrillDown: () => void };

export type ResourceBigCalendarViewProps<TEvent extends object> = {
  events: TEvent[];
  view: View;
  onViewChange: (view: View) => void;
  date: Dayjs;
  onDateChange: (date: Dayjs) => void;
  onSelectEvent: (event: TEvent) => void;
  EventComponent: ComponentType<{ event: TEvent }>;
  renderToolbar: (toolbarProps: ToolbarProps) => ReactNode;
  monthDateHeader: ComponentType<DateHeaderProps>;
  eventPropGetter: EventPropGetter<TEvent>;
  /** Extra wrapper `sx` merged after theme + density styles (e.g. per-feature tweaks). */
  extraWrapperSx?: (theme: Theme) => SystemStyleObject<Theme>;
  children?: ReactNode;
};

export function ResourceBigCalendarView<TEvent extends object>({
  events,
  view,
  onViewChange,
  date,
  onDateChange,
  onSelectEvent,
  EventComponent,
  renderToolbar,
  monthDateHeader,
  eventPropGetter,
  extraWrapperSx,
  children,
}: ResourceBigCalendarViewProps<TEvent>) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [sidebarOpen] = useSidebarState();
  const timeGridProps = useResourceCalendarTimeGridProps(view);

  const shellSx = useMemo(
    () => resourceCalendarShellSx({ isMobile, sidebarOpen }),
    [isMobile, sidebarOpen]
  );

  return (
    <ResourceCalendarViewProvider view={view}>
      <Box
        sx={(theme) => ({
          ...reactBigCalendarWrapperSx(theme),
          ...resourceBigCalendarDensitySx(theme),
          ...shellSx,
          ...(extraWrapperSx ? extraWrapperSx(theme) : {}),
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
            onView={(v: View) => onViewChange(v)}
            onNavigate={(val: Date) => onDateChange(dayjs(val))}
            onSelectEvent={(e: TEvent) => onSelectEvent(e)}
            style={{ height: "100%", width: "100%" }}
            tooltipAccessor={null}
            date={date.toDate()}
            popup
            dayLayoutAlgorithm="overlap"
            {...timeGridProps}
            components={{
              event: EventComponent,
              toolbar: (toolbarProps: ToolbarProps) => renderToolbar(toolbarProps),
              month: { dateHeader: monthDateHeader },
              week: { header: monthDateHeader },
            }}
            eventPropGetter={eventPropGetter}
          />
        </Box>
        {children}
      </Box>
    </ResourceCalendarViewProvider>
  );
}
