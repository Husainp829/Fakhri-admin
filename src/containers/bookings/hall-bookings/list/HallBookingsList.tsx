import { Title } from "react-admin";
import { useSearchParams } from "react-router-dom";
import { HallBookingsCalendarView } from "./HallBookingsCalendarView";
import { HallBookingsListView } from "./HallBookingsListView";

export const HallBookingsList = () => {
  const [searchParams] = useSearchParams();
  const viewParam = searchParams.get("tab") || "CALENDAR";
  return (
    <div>
      <Title title="Hall Bookings" />
      {viewParam === "CALENDAR" && <HallBookingsCalendarView />}
      {viewParam === "LIST" && <HallBookingsListView />}
    </div>
  );
};

export default HallBookingsList;
