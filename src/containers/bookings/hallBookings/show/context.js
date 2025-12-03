// BookingTotalsContext.js
import React, { createContext, useContext, useMemo } from "react";
import { calcBookingTotals } from "../../../../utils/bookingCalculations"; // adjust path

const BookingShowContext = createContext(null);

export const BookingShowProvider = ({ record, children }) => {
  const value = useMemo(() => {
    if (!record) return {};

    return calcBookingTotals({
      halls: (record.hallBookings || []).map((h) => ({ ...h, ...h.hall, ...h.bookingPurpose })),
      ...record,
    });
  }, [record]);

  return <BookingShowContext.Provider value={value}>{children}</BookingShowContext.Provider>;
};

export const useShowTotals = () => {
  const context = useContext(BookingShowContext);
  if (!context) {
    throw new Error("useShowTotals must be used inside BookingShowProvider");
  }
  return context;
};
