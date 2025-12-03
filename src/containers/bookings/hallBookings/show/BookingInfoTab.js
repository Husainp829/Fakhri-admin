import React from "react";
import { Box } from "@mui/material";
import BookingSummary from "./components/BookingSummary";
import HallBookingsTable from "./components/HallBookingsTable";

const BookingInfoTab = () => (
  <Box sx={{ px: 3 }}>
    <BookingSummary />
    <HallBookingsTable />
  </Box>
);

export default BookingInfoTab;
