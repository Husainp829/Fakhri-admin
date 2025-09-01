import React from "react";
import { Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { CreateButton, Title, TopToolbar } from "react-admin";
import { useSearchParams } from "react-router-dom";
import CalenderView from "./calenderView";
import ListView from "./listView";

const BookingActions = () => (
  <TopToolbar>
    <CreateButton resource="bookings" />
  </TopToolbar>
);

const HallBookingCalendar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get("tab") || "CALENDAR";

  const handleChange = (e, newValue) => {
    if (newValue) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", newValue);
      setSearchParams(newParams);
    }
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
        <ToggleButtonGroup value={viewParam} exclusive onChange={handleChange} sx={{ ml: 3 }}>
          <ToggleButton value="CALENDAR" aria-label="calendar">
            <CalendarMonthIcon />
          </ToggleButton>
          <ToggleButton value="LIST" aria-label="list">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {viewParam === "CALENDAR" && <CalenderView />}
      {viewParam === "LIST" && <ListView />}
    </div>
  );
};

export default HallBookingCalendar;
