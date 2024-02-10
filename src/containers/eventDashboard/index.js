import React, { useContext, useEffect, useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Button, Title, useNotify } from "react-admin";
import ArrowBack from "@mui/icons-material/ArrowBack";
import GridList from "./gridList";
import { callApi } from "../../dataprovider/miscApis";
import { EventContext } from "../../dataprovider/eventProvider";
import { goToDashboard } from "../../utils";

const EventList = () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const notify = useNotify();

  const [registrations, setRegistrations] = useState([]);
  const [udf, setUdf] = useState([]);
  const [speakers, setSpeakers] = useState(0);
  const [loading, setLoading] = useState(false);

  const getStats = async () => {
    setLoading(true);
    await callApi("getEventStats", {}, "GET")
      .then(({ data }) => {
        setRegistrations([...data.registrationCounts, ...data.registrationScanCounts]);
        setUdf(data.udf);
        setSpeakers(data.speakers);
      })
      .catch(() => {
        notify("Error loading data", { type: "warning" });
      });
    setLoading(false);
  };
  useEffect(() => {
    getStats();
  }, []);
  const { currentEvent } = useContext(EventContext);
  const statusList = currentEvent.statusList?.REGISTER || [];
  return (
    <>
      <Title title="DASHBOARD" />

      <Box sx={{ mt: 2 }}>
        <Button
          label="Back"
          onClick={() => {
            goToDashboard();
          }}
        >
          <ArrowBack />
        </Button>
        <Box width={isSmall ? "auto" : "calc(100% - 1em)"}>
          <GridList
            udf={udf}
            registrations={registrations}
            isSmall={isSmall}
            speakers={speakers}
            statusList={statusList}
            isLoading={loading}
          />
        </Box>
      </Box>
    </>
  );
};

export default EventList;
