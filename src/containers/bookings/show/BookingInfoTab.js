import React from "react";
import { useRecordContext } from "react-admin";
import { Box } from "@mui/material";
import BookingSummary from "./components/BookingSummary";
import HallBookingsTable from "./components/HallBookingsTable";

const BookingInfoTab = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Box sx={{ px: 3 }}>
      <BookingSummary />

      <HallBookingsTable />
    </Box>
  );
};

export default BookingInfoTab;
