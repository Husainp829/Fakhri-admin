import { Box } from "@mui/material";
import { HallBookingsBookingSummary } from "./components/HallBookingsBookingSummary";
import { HallBookingsBookingAgreedTotalEdit } from "./components/HallBookingsBookingAgreedTotalEdit";
import { HallBookingsShowTable } from "./components/HallBookingsShowTable";

export const BookingInfoTab = () => (
  <Box sx={{ px: 3 }}>
    <HallBookingsBookingSummary />
    <HallBookingsBookingAgreedTotalEdit />
    <HallBookingsShowTable />
  </Box>
);

export default BookingInfoTab;
