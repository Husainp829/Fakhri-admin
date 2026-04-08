import { Box } from "@mui/material";
import type { ToolbarProps } from "react-big-calendar";
import type { Dayjs } from "dayjs";
import CustomCalendarToolbar from "@/components/CustomCalendarToolbar";
import { HallBookingsCalendarLegend } from "./HallBookingsCalendarLegend";
import type { HallBookingCalendarEvent } from "./types";

export type ToolbarWithLegendProps = ToolbarProps & {
  events: HallBookingCalendarEvent[];
  selectedDate: Dayjs;
  setSelectedDate: (d: Dayjs) => void;
};

export function HallBookingsCalendarToolbarWithLegend({
  events,
  selectedDate,
  setSelectedDate,
  ...toolbarProps
}: ToolbarWithLegendProps) {
  return (
    <Box
      sx={{
        flexShrink: 0,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <CustomCalendarToolbar
        {...toolbarProps}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <HallBookingsCalendarLegend events={events} />
    </Box>
  );
}
