import React from "react";
import { Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useSearchParams } from "react-router-dom";
import { CreateButton, usePermissions } from "react-admin";
import { useBaseRoute } from "../../../../utils/routeUtility";

const BookingActions = ({ permissions }) => (
  <>{permissions?.bookings?.edit && <CreateButton resource="bookings" />}</>
);

const ViewToggle = ({ hideCreateButton }) => {
  const { permissions } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const baseRoute = useBaseRoute();
  const viewParam = searchParams.get("tab") || "CALENDAR";
  const handleChange = (e, newValue) => {
    if (newValue && baseRoute === "bookings") {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", newValue);
      setSearchParams(newParams);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {!hideCreateButton && <BookingActions permissions={permissions} />}
      {permissions?.bookingReceipts?.view && (
        <ToggleButtonGroup
          value={viewParam}
          exclusive
          onChange={handleChange}
          sx={{ ml: 3, display: "flex", alignItems: "center" }}
          size="small"
        >
          <ToggleButton value="CALENDAR" aria-label="calendar" sx={{ height: 40 }}>
            <CalendarMonthIcon />
          </ToggleButton>
          <ToggleButton value="LIST" aria-label="list" sx={{ height: 40 }}>
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      )}
    </Box>
  );
};

export default ViewToggle;
