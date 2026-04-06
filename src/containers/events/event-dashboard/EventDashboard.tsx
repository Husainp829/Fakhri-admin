import React, { useEffect, useState } from "react";
import { Box, useMediaQuery, Divider, Typography } from "@mui/material";
import { Title, useNotify, useStore } from "react-admin";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { EventDashboardGridList } from "./EventDashboardGridList";
import { EventDashboardNamaazStats } from "./EventDashboardNamaazStats";
import { callApi } from "@/dataprovider/misc-apis";
import { MARKAZ_LIST } from "@/constants";
import { useRouteId } from "@/utils/route-utility";
import {
  isEventStatsPayload,
  type CurrentEvent,
  type DayWiseReceiptReportRow,
  type EventStatsNamaazRow,
  type EventStatsNiyaazRow,
} from "@/containers/events/types";

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const EventDashboard = () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const notify = useNotify();

  const [niyaazCounts, setNiyaazCounts] = useState<EventStatsNiyaazRow[]>([]);
  const [namaazCounts, setNamaazCounts] = useState<EventStatsNamaazRow[]>([]);
  const [receiptReport, setReceiptReport] = useState<DayWiseReceiptReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const eventId = useRouteId();
  const [value, setValue] = useState<string>("FM");
  const [namaazValue, setNamaazValue] = useState<string>("FM");
  const [currentEvent] = useStore<CurrentEvent | null>("currentEvent");

  const handleChange = (_e: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  const handleNamaazVenueChange = (_e: React.SyntheticEvent, newValue: string) => {
    setNamaazValue(newValue);
  };

  const getStats = async () => {
    setLoading(true);
    try {
      const { data } = await callApi({
        location: "stats",
        headers: { eventId: String(eventId) },
        method: "GET",
      });
      if (isEventStatsPayload(data)) {
        setNiyaazCounts(data.niyaazCounts);
        setNamaazCounts(data.namaazVenueCounts);
        setReceiptReport(data.dayWiseReceiptReport);
      }
    } catch {
      notify("Error loading data", { type: "warning" });
    }
    setLoading(false);
  };

  useEffect(() => {
    void getStats();
  }, []);

  return (
    <>
      <Title title={currentEvent?.name} />

      <Box width={isSmall ? "auto" : "calc(100% - 1em)"} sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Jaman Venue Stats
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange} aria-label="Markaz Tabs">
            {Object.keys(MARKAZ_LIST).map((markaz) => (
              <Tab
                label={MARKAZ_LIST[markaz as keyof typeof MARKAZ_LIST]}
                {...a11yProps(0)}
                key={markaz}
                value={markaz}
              />
            ))}
          </Tabs>
        </Box>

        <EventDashboardGridList
          niyaazCounts={niyaazCounts}
          receiptReport={receiptReport}
          isLoading={loading}
          selectedMarkaz={value}
        />
      </Box>
      <Divider />
      <Box width={isSmall ? "auto" : "calc(100% - 1em)"} sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Namaaz Venue Stats
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={namaazValue} onChange={handleNamaazVenueChange} aria-label="Markaz Tabs">
            {Object.keys(MARKAZ_LIST).map((namaazVenue) => (
              <Tab
                label={MARKAZ_LIST[namaazVenue as keyof typeof MARKAZ_LIST]}
                {...a11yProps(0)}
                key={namaazVenue}
                value={namaazVenue}
              />
            ))}
          </Tabs>
        </Box>
        <EventDashboardNamaazStats namaazCounts={namaazCounts} selectedMarkaz={namaazValue} />
      </Box>
    </>
  );
};
