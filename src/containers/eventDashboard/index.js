import React, { useEffect, useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Title, useNotify } from "react-admin";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import GridList from "./gridList";
import { callApi } from "../../dataprovider/miscApis";
import { getEventId } from "../../utils";
import { MARKAZ_LIST } from "../../constants";
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
  const [receiptReport, setReceiptReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const eventId = getEventId();
  const [value, setValue] = useState("ZM");

  const handleChange = (e, newValue) => {
    setValue(newValue);
  };

  const getStats = async () => {
    setLoading(true);
    await callApi("stats", {}, "GET", { eventId })
      .then(({ data }) => {
        setNiyaazCounts(data.niyaazCounts);
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
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange} aria-label="Markaz Tabs">
            {Object.keys(MARKAZ_LIST).map((markaz) => (
              <Tab label={MARKAZ_LIST[markaz]} {...a11yProps(0)} key={markaz} value={markaz} />
            ))}
          </Tabs>
        </Box>
        <GridList
          niyaazCounts={niyaazCounts}
          receiptReport={receiptReport}
          isSmall={isSmall}
          isLoading={loading}
          selectedMarkaz={value}
        />
      </Box>
    </>
  );
};

export default EventList;
