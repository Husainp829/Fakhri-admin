import React from "react";
import { Datagrid, TextField, List } from "react-admin";
import Icon from "@mui/icons-material/Warehouse";

const ListHalls = () => (
  <List sort={{ field: "name", order: "DESC" }}>
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="name" label="Name" />
      <TextField source="shortCode" label="ShortCode" />
    </Datagrid>
  </List>
);

export default {
  list: ListHalls,
  icon: Icon,
  label: "Halls",
  options: { label: "Halls" },
  name: "halls",
};
