import React, { useEffect, useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Button, Title, useNotify } from "react-admin";
import ArrowBack from "@mui/icons-material/ArrowBack";
import GridList from "./gridList";
import { callApi } from "../../dataprovider/miscApis";
import { getEventId, goToDashboard } from "../../utils";

const EventList = () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const notify = useNotify();

  const [niyaazCounts, setNiyaazCounts] = useState([]);
  const [receiptReport, setReceiptReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const eventId = getEventId();

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
      <Box sx={{ mt: 2, p: 2 }}>
        <Button
          label="Select Event"
          onClick={() => {
            goToDashboard();
          }}
        >
          <ArrowBack />
        </Button>
        <Box width={isSmall ? "auto" : "calc(100% - 1em)"}>
          <GridList
            niyaazCounts={niyaazCounts}
            receiptReport={receiptReport}
            isSmall={isSmall}
            isLoading={loading}
          />
        </Box>
      </Box>
    </>
  );
};

export default EventList;
