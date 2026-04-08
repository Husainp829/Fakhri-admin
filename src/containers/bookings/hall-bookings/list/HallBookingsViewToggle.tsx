import { Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useSearchParams } from "react-router-dom";
import { CreateButton, usePermissions } from "react-admin";
import { useBaseRoute } from "@/utils/route-utility";
import { hasPermission } from "@/utils/permission-utils";
import type { PermissionRecord } from "@/types/permissions";

const BookingActions = ({ permissions }: { permissions: PermissionRecord | undefined }) => (
  <>{hasPermission(permissions, "bookings.edit") && <CreateButton resource="bookings" />}</>
);

type HallBookingsViewToggleProps = {
  hideCreateButton?: boolean;
};

export const HallBookingsViewToggle = ({ hideCreateButton }: HallBookingsViewToggleProps) => {
  const { permissions } = usePermissions() as { permissions: PermissionRecord | undefined };
  const [searchParams, setSearchParams] = useSearchParams();
  const baseRoute = useBaseRoute();
  const viewParam = searchParams.get("tab") || "CALENDAR";
  const handleChange = (_e: React.MouseEvent<HTMLElement>, newValue: string | null) => {
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
      {hasPermission(permissions, "bookingReceipts.view") && (
        <ToggleButtonGroup
          value={viewParam}
          exclusive
          onChange={handleChange}
          sx={{ ml: 3, display: "flex", alignItems: "center" }}
          size="small"
        >
          <ToggleButton value="CALENDAR" aria-label="calendar">
            <CalendarMonthIcon />
          </ToggleButton>
          <ToggleButton value="LIST" aria-label="list">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      )}
    </Box>
  );
};

export default HallBookingsViewToggle;
