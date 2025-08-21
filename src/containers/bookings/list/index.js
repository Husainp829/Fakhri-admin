import React, { useState } from "react";
import { Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { CreateButton, Title, TopToolbar } from "react-admin";
import CalenderView from "./calenderView";
import ListView from "./listView";

const BookingActions = () => (
  <TopToolbar>
    <CreateButton resource="bookings" />
  </TopToolbar>
);

const HallBookingCalendar = () => {
  const [value, setValue] = useState("CALENDAR");
  const handleChange = (e, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <Title title="Hall Bookings Calendar" />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <BookingActions />
        <ToggleButtonGroup value={value} exclusive onChange={handleChange} sx={{ ml: 3 }}>
          <ToggleButton value="CALENDAR" aria-label="calendar">
            <CalendarMonthIcon />
          </ToggleButton>
          <ToggleButton value="LIST" aria-label="list">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {value === "CALENDAR" && <CalenderView />}
      {value === "LIST" && <ListView />}
    </div>
  );
};

export default HallBookingCalendar;
