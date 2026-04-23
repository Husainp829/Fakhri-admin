/** Single hall line on a booking used by calcBookingTotals. */
export type BookingHallLine = {
  rent?: number;
  deposit?: number;
  thaals?: number;
  acCharges?: number;
  kitchenCleaning?: number;
  withAC?: boolean;
  includeThaalCharges?: boolean;
  perThaal?: number;
};

export type CalcBookingTotalsInput = {
  halls?: BookingHallLine[];
  depositPaidAmount?: number;
  agreedTotalPayable?: number | null;
  extraExpenses?: number;
  writeOffAmount?: number;
  paidAmount?: number;
};
