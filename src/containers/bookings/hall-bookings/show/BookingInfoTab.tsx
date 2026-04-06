import { Box } from "@mui/material";
import { HallBookingsBookingSummary } from "./components/HallBookingsBookingSummary";
import { HallBookingsShowTable } from "./components/HallBookingsShowTable";

export const BookingInfoTab = () => (
  <Box sx={{ px: 3 }}>
    <HallBookingsBookingSummary />
    <HallBookingsShowTable />
  </Box>
);

export default BookingInfoTab;
