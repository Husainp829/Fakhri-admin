import React from "react";
import { Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useSearchParams } from "react-router-dom";
import { CreateButton, usePermissions } from "react-admin";
import { hasPermission } from "@/utils/permission-utils";

/** Mirrors hall bookings `BookingActions` + `ViewToggle` structure. */
const OhbatMajlisActions = ({ permissions }) => (
  <>
    {hasPermission(permissions, "ohbatMajalis.create") && <CreateButton resource="ohbatMajalis" />}
  </>
);

const ViewToggle = ({ hideCreateButton }) => {
  const { permissions } = usePermissions();
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
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        flexShrink: 0,
        minWidth: "fit-content",
      }}
    >
      {!hideCreateButton && <OhbatMajlisActions permissions={permissions} />}
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
    </Box>
  );
};

export default ViewToggle;
