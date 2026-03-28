import React from "react";
import { Title } from "react-admin";
import { useSearchParams } from "react-router-dom";
import CalenderView from "./calenderView";
import ListView from "./listView";

const OhbatMajlisCalendar = () => {
  const [searchParams] = useSearchParams();
  const viewParam = searchParams.get("tab") || "CALENDAR";
  return (
    <div>
      <Title title="Ohbat majlis" />
      {viewParam === "CALENDAR" && <CalenderView />}
      {viewParam === "LIST" && <ListView />}
    </div>
  );
};

export default OhbatMajlisCalendar;
