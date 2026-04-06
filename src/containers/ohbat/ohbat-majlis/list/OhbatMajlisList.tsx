import { Title } from "react-admin";
import { useSearchParams } from "react-router-dom";
import { OhbatMajlisCalenderView } from "./OhbatMajlisCalenderView";
import OhbatMajlisListView from "./OhbatMajlisListView";

export default function OhbatMajlisList() {
  const [searchParams] = useSearchParams();
  const viewParam = searchParams.get("tab") || "CALENDAR";
  return (
    <div>
      <Title title="Ohbat majlis" />
      {viewParam === "CALENDAR" && <OhbatMajlisCalenderView />}
      {viewParam === "LIST" && <OhbatMajlisListView />}
    </div>
  );
}
