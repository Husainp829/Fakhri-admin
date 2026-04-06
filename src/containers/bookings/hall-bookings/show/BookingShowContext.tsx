import { createContext, useContext, useMemo, type ReactNode } from "react";
import { calcBookingTotals } from "@/utils/booking-calculations";
import type { RaRecord } from "react-admin";

type TotalsValue = ReturnType<typeof calcBookingTotals>;

const BookingShowContext = createContext<TotalsValue | null>(null);

export const BookingShowProvider = ({
  record,
  children,
}: {
  record: RaRecord;
  children: ReactNode;
}) => {
  const value = useMemo(() => {
    if (!record) {
      return calcBookingTotals({ halls: [] });
    }

    const hallBookings = (record.hallBookings as RaRecord[] | undefined) ?? [];
    return calcBookingTotals({
      halls: hallBookings.map((h) => ({ ...h, ...h.hall, ...h.bookingPurpose })),
      ...record,
    } as Parameters<typeof calcBookingTotals>[0]);
  }, [record]);

  return <BookingShowContext.Provider value={value}>{children}</BookingShowContext.Provider>;
};

export const useShowTotals = (): TotalsValue => {
  const context = useContext(BookingShowContext);
  if (!context) {
    throw new Error("useShowTotals must be used inside BookingShowProvider");
  }
  return context;
};
