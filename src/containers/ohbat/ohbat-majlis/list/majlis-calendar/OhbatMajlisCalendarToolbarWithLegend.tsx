import type { ComponentType } from "react";
import { Box } from "@mui/material";
import type { ToolbarProps } from "react-big-calendar";
import type { Dayjs } from "dayjs";
import CustomCalendarToolbar from "@/components/CustomCalendarToolbar";
import { OhbatMajlisCalendarLegend } from "./OhbatMajlisCalendarLegend";
import type { OhbatMajlisCalendarEvent } from "./types";

export type OhbatMajlisCalendarToolbarWithLegendProps = ToolbarProps & {
  events: OhbatMajlisCalendarEvent[];
  selectedDate: Dayjs;
  setSelectedDate: (d: Dayjs) => void;
  listToggleComponent?: ComponentType;
};

export function OhbatMajlisCalendarToolbarWithLegend({
  events,
  selectedDate,
  setSelectedDate,
  listToggleComponent,
  ...toolbarProps
}: OhbatMajlisCalendarToolbarWithLegendProps) {
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
        listToggleComponent={listToggleComponent}
      />
      <OhbatMajlisCalendarLegend events={events} />
    </Box>
  );
}
