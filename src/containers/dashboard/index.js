/* eslint-disable no-shadow */
import React, { useContext } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Title } from "react-admin";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import dayjs from "dayjs";
import GridList from "./gridList";
import { EventContext } from "../../dataprovider/eventProvider";

const EventList = () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const { events, eventsLoading } = useContext(EventContext);
  // eslint-disable-next-line no-console
  console.log(EventContext);

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function TabPanel(props) {
    const { children, value, index } = props;
    if (value === index) return <Box width={isSmall ? "auto" : "calc(100% - 1em)"}>{children}</Box>;
    return null;
  }
  function a11yProps(index) {
    return {
      id: `event-tab-${index}`,
      "aria-controls": `event-tabpanel-${index}`,
    };
  }
  if (!events) return null;
  const activeEvents = [];
  const pastEvents = [];
  events.map((e) => {
    if (dayjs(e.toDate) > dayjs()) {
      activeEvents.push(e);
    } else {
      pastEvents.push(e);
    }
    return e;
  });

  return (
    <>
      <Title title="ADMIN" />
      <Box display="flex">
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 1 }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="ACTIVE" {...a11yProps(0)} />
              <Tab label="PAST" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <GridList events={activeEvents} isSmall={isSmall} isLoading={eventsLoading} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <GridList events={pastEvents} isSmall={isSmall} isLoading={eventsLoading} />
          </TabPanel>
        </Box>
      </Box>
    </>
  );
};

export default EventList;
