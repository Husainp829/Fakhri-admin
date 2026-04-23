export type HallBookingCalendarEvent = {
  id: string | number;
  title: string;
  subTitle?: string;
  start: Date;
  end: Date;
  tentative?: boolean;
  isBlockedDate?: boolean;
  purpose?: string;
  resource?: HallBookingResource;
};

export type HallBookingResource = {
  id?: string;
  date?: string;
  slot?: string;
  purpose?: string;
  remarks?: string | null;
  hall?: { id?: string; name?: string; shortCode?: string; color?: string | null };
  booking?: {
    organiser?: string;
    itsNo?: string;
    phone?: string;
    paidAmount?: number;
    depositPaidAmount?: number;
  };
  bookingId?: string;
  isBlockedDate?: boolean;
};
