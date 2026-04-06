/* eslint-disable no-shadow */
import React, { useEffect, useMemo } from "react";
import { Box, useMediaQuery } from "@mui/material";
import {
  Title,
  useDataProvider,
  useNotify,
  useStore,
  CreateButton,
  usePermissions,
} from "react-admin";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import dayjs from "dayjs";
import { EventsDashboardGridList } from "./EventsDashboardGridList";
import { hasPermission } from "@/utils/permission-utils";
import type { EventsListRecord } from "@/containers/events/types";
import type { RaRecord } from "react-admin";

const isEventRecord = (r: RaRecord): r is RaRecord & EventsListRecord =>
  typeof r.id !== "undefined" && typeof r.name === "string";

export const EventsDashboard = () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [events, setEvents] = useStore<RaRecord[]>("events", []);
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
      .catch((error: Error) => {
        notify(error.message, { type: "warning" });
      });
  }, [dataProvider, notify, setEvents]);

  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function TabPanel(tabProps: { children?: React.ReactNode; value: number; index: number }) {
    const { children, value: v, index } = tabProps;
    if (v === index) return <Box width={isSmall ? "auto" : "calc(100% - 1em)"}>{children}</Box>;
    return null;
  }
  function a11yProps(index: number) {
    return {
      id: `event-tab-${index}`,
      "aria-controls": `event-tabpanel-${index}`,
    };
  }

  const typedEvents = useMemo(
    () => events.filter((e): e is RaRecord & EventsListRecord => isEventRecord(e)),
    [events]
  );

  const { activeEvents, pastEvents } = useMemo(
    () =>
      typedEvents.reduce(
        (acc, event) => {
          if (dayjs(event.toDate) > dayjs()) {
            acc.activeEvents.push(event);
          } else {
            acc.pastEvents.push(event);
          }
          return acc;
        },
        { activeEvents: [] as EventsListRecord[], pastEvents: [] as EventsListRecord[] }
      ),
    [typedEvents]
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
            <EventsDashboardGridList events={activeEvents} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <EventsDashboardGridList events={pastEvents} />
          </TabPanel>
        </Box>
      </Box>
    </>
  );
};
