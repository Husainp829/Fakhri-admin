// CustomCalendarToolbar.jsx
import React from "react";
import { Box, IconButton, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import Grid from "@mui/material/Grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import dayjs from "dayjs";

const CustomCalendarToolbar = ({
  label,
  onNavigate,
  selectedDate,
  setSelectedDate,
  view,
  onView,
}) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Box px={2} pb={2}>
      <Grid container alignItems="center" spacing={2} justifyContent="space-between">
        {/* Navigation Buttons */}
        <Grid item container alignItems="center">
          {/* Date Picker */}
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
            sx={{ maxWidth: 200 }}
          />
          <IconButton onClick={() => onNavigate("PREV")}>
            <ArrowBackIcon />
          </IconButton>
          <IconButton onClick={() => onNavigate("NEXT")}>
            <ArrowForwardIcon />
          </IconButton>
        </Grid>

        {/* Label */}
        <Grid item>
          <Typography variant="h6" align="center">
            {label}
          </Typography>
        </Grid>

        {/* View Tabs */}
        <Grid item>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, nextView) => {
              if (nextView) onView(nextView);
            }}
            size="small"
            aria-label="view toggle"
          >
            <ToggleButton value="day">Day</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
    </Box>
  </LocalizationProvider>
);

export default CustomCalendarToolbar;
