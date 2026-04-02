/* eslint-disable no-shadow */
import React, { useEffect, useMemo } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Title, useDataProvider, useNotify, useStore, usePermissions, CreateButton } from "react-admin";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import dayjs from "dayjs";
import GridList from "./gridList";
import { hasPermission } from "../../../utils/permissionUtils";

const EventList = () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [events, setEvents] = useStore("events", []);
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const { permissions } = usePermissions();

  useEffect(() => {
    dataProvider
      .getList("events", {
        sort: { order: "ASC", field: "fromDate" },
        pagination: { page: 1, perPage: 999 },
      })
      .then(({ data }) => {
        setEvents(data);
      })
      .catch((error) => {
        notify(error);
      });
  }, []);

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

  const { activeEvents, pastEvents } = useMemo(
    () =>
      events.reduce(
        (acc, event) => {
          if (dayjs(event.toDate) > dayjs()) {
            acc.activeEvents.push(event);
          } else {
            acc.pastEvents.push(event);
          }
          return acc;
        },
        { activeEvents: [], pastEvents: [] }
      ),
    [events]
  );

  if (!events) return null;

  return (
    <>
      <Title title="Events" />
      <Box display="flex" justifyContent="flex-end" sx={{ mb: 2, mt: 1 }}>
        {hasPermission(permissions, "event.create") && <CreateButton resource="events" />}
      </Box>
      <Box display="flex">
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 1 }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="ACTIVE" {...a11yProps(0)} />
              <Tab label="PAST" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <GridList events={activeEvents} isSmall={isSmall} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <GridList events={pastEvents} isSmall={isSmall} />
          </TabPanel>
        </Box>
      </Box>
    </>
  );
};

export default EventList;
