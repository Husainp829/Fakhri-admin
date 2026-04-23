import React from "react";
import { Box, IconButton, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import Grid from "@mui/material/Grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AppDatePickerLocalization } from "@/components/AppDatePickerLocalization";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { fromGregorian } from "@/utils/hijri-date-utils";
import HallBookingsViewToggle from "@/containers/bookings/hall-bookings/list/HallBookingsViewToggle";

export type CustomCalendarToolbarProps = {
  label: string;
  onNavigate: (action: string, newDate?: Date) => void;
  date: Date;
  view: string;
  onView: (view: string) => void;
  selectedDate: Dayjs;
  setSelectedDate: (d: Dayjs) => void;
  showListToggle?: boolean;
  /** When set, rendered instead of hall bookings ViewToggle (e.g. ohbat majlis). */
  listToggleComponent?: React.ComponentType;
};

const CustomCalendarToolbar = ({
  label,
  onNavigate,
  selectedDate,
  setSelectedDate,
  view,
  onView,
  date,
  showListToggle = true,
  listToggleComponent: ListToggleComponent,
}: CustomCalendarToolbarProps) => (
  <AppDatePickerLocalization>
    <Box p={1}>
      <Grid container alignItems="center" spacing={2} justifyContent="space-between">
        <Grid container alignItems="center" justifyContent="start">
          <DatePicker
            label="Jump to date"
            value={selectedDate}
            onChange={(newValue) => {
              if (newValue && newValue.isValid()) {
                setSelectedDate(dayjs(newValue));
                onNavigate("DATE", dayjs(newValue).toDate());
              }
            }}
            slotProps={{
              textField: {
                size: "small",
                inputProps: { readOnly: true },
              },
            }}
            sx={{ maxWidth: 220 }}
          />
          <IconButton onClick={() => onNavigate("PREV")} size="small">
            <ArrowBackIcon />
          </IconButton>
          <IconButton onClick={() => onNavigate("NEXT")} size="small">
            <ArrowForwardIcon />
          </IconButton>
        </Grid>

        <Grid>
          <Typography variant="subtitle2" align="center">
            {view === "day" ? `${label} | ${fromGregorian(new Date(date), "short")}` : label}
          </Typography>
        </Grid>

        <Grid container alignItems="center" justifyContent="space-between">
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_e, nextView) => {
              if (nextView) onView(nextView);
            }}
            size="small"
            aria-label="view toggle"
          >
            <ToggleButton value="day">Day</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
          </ToggleButtonGroup>
          {showListToggle &&
            (ListToggleComponent ? (
              <ListToggleComponent />
            ) : (
              <HallBookingsViewToggle hideCreateButton={false} />
            ))}
        </Grid>
      </Grid>
    </Box>
  </AppDatePickerLocalization>
);

export default CustomCalendarToolbar;
