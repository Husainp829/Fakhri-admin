import React from "react";
import { Title } from "react-admin";
import { useSearchParams } from "react-router-dom";
import CalenderView from "./calenderView";
import ListView from "./listView";

const HallBookingCalendar = () => {
  const [searchParams] = useSearchParams();
  const viewParam = searchParams.get("tab") || "CALENDAR";
  return (
    <div>
      <Title title="Hall Bookings" />
      {viewParam === "CALENDAR" && <CalenderView />}
      {viewParam === "LIST" && <ListView />}
    </div>
  );
};

export default HallBookingCalendar;
