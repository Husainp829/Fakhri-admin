import React, { useEffect, useState } from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  EditButton,
  ShowButton,
  useListContext,
} from "react-admin";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const mealTypeLabel = (mealType) => (mealType === "LUNCH" ? "Lunch" : "Evening");

const PERIOD_TABS = [
  { id: 0, period: "upcoming", name: "Upcoming" },
  { id: 1, period: "past", name: "Past" },
];

const getTabIdFromFilters = (filters) => {
  const t = PERIOD_TABS.findIndex((s) => s.period === filters?.period);
  if (t !== -1) return t;
  return 0;
};

function TabbedDatagrid(props) {
  const { filterValues, setFilters, setSort } = useListContext();
  const [tabValue, setTabValue] = useState(getTabIdFromFilters(filterValues));

  const handleChange = (event, value) => {
    const tab = PERIOD_TABS[value] ?? PERIOD_TABS[0];
    setFilters({ ...filterValues, period: tab.period });
    // Default sort: Upcoming = ASC (soonest first), Past = DESC (newest first)
    const order = tab.period === "past" ? "DESC" : "ASC";
    setSort("englishDate", order);
  };

  // Sync tab selection with filter (do not sync sort here – it would overwrite manual sort)
  useEffect(() => {
    setTabValue(getTabIdFromFilters(filterValues));
  }, [filterValues]);

  return (
    <>
      <Tabs value={tabValue} indicatorColor="primary" onChange={handleChange}>
        {PERIOD_TABS.map((tab) => (
          <Tab key={tab.id} label={tab.name} value={tab.id} />
        ))}
      </Tabs>
      <Divider />
      <div>
        <Datagrid rowClick="show" {...props}>
          <TextField source="name" label="Name" />
          <TextField source="venue" label="Venue" />
          <DateField source="englishDate" label="Date" showTime={false} />
          <FunctionField
            label="Slot"
            source="mealType"
            render={(record) => mealTypeLabel(record.mealType)}
          />
          <ShowButton />
          <EditButton />
        </Datagrid>
      </div>
    </>
  );
}

const getFilterFromURL = () => {
  if (typeof window === "undefined") return { period: "upcoming" };
  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get("filter");
  if (filterParam) {
    try {
      const parsed = JSON.parse(filterParam);
      return { ...parsed, period: parsed.period || "upcoming" };
    } catch (e) {
      console.error("Error parsing filter from URL:", e);
    }
  }
  return { period: "upcoming" };
};

export default function MiqaatList(props) {
  return (
    <List {...props} filterDefaultValues={getFilterFromURL()}>
      <TabbedDatagrid {...props} />
    </List>
  );
}
