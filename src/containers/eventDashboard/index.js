import React, { useEffect, useState } from "react";
import { Box, useMediaQuery, Divider, Typography } from "@mui/material";
import { Title, useNotify } from "react-admin";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import GridList from "./gridList";
import { callApi } from "../../dataprovider/miscApis";
import { getEventId } from "../../utils";
import { MARKAZ_LIST, NAMAAZ_VENUE } from "../../constants";
import NamaazStats from "./namaazStats";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
const EventList = () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const notify = useNotify();

  const [niyaazCounts, setNiyaazCounts] = useState([]);
  const [namaazCounts, setNamaazCounts] = useState([]);
  const [receiptReport, setReceiptReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const eventId = getEventId();
  const [value, setValue] = useState("FM");
  const [namaazValue, setNamaazValue] = useState("FM");

  const handleChange = (e, newValue) => {
    setValue(newValue);
  };
  const handleNamaazVenueChange = (e, newValue) => {
    setNamaazValue(newValue);
  };

  const getStats = async () => {
    setLoading(true);
    await callApi({ location: "stats", headers: { eventId }, method: "GET" })
      .then(({ data }) => {
        setNiyaazCounts(data.niyaazCounts);
        setNamaazCounts(data.namaazVenueCounts);
        setReceiptReport(data.dayWiseReceiptReport);
      })
      .catch(() => {
        notify("Error loading data", { type: "warning" });
      });
    setLoading(false);
  };
  useEffect(() => {
    getStats();
  }, []);

  return (
    <>
      <Title title="DASHBOARD" />

      <Box width={isSmall ? "auto" : "calc(100% - 1em)"} sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Jaman Venue Stats
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange} aria-label="Markaz Tabs">
            {Object.keys(MARKAZ_LIST).map((markaz) => (
              <Tab label={MARKAZ_LIST[markaz]} {...a11yProps(0)} key={markaz} value={markaz} />
            ))}
          </Tabs>
        </Box>

        <GridList
          niyaazCounts={niyaazCounts}
          namaazCounts={namaazCounts}
          receiptReport={receiptReport}
          isSmall={isSmall}
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
            {Object.keys(NAMAAZ_VENUE).map((namaazVenue) => (
              <Tab
                label={NAMAAZ_VENUE[namaazVenue]}
                {...a11yProps(0)}
                key={namaazVenue}
                value={namaazVenue}
              />
            ))}
          </Tabs>
        </Box>
        <NamaazStats namaazCounts={namaazCounts} selectedMarkaz={namaazValue} />
      </Box>
    </>
  );
};

export default EventList;
