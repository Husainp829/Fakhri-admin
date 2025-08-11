import React from "react";
import { Datagrid, TextField, List } from "react-admin";
import Icon from "@mui/icons-material/CalendarMonth";

const ListMohalla = () => (
  <List sort={{ field: "id", order: "DESC" }}>
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="id" label="Purpose" />
    </Datagrid>
  </List>
);

export default {
  list: ListMohalla,
  icon: Icon,
  label: "Purpose",
  options: { label: "Purpose" },
  name: "bookingPurpose",
};
