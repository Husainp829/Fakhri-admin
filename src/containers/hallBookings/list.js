import React from "react";
import { Datagrid, List, TextField } from "react-admin";

const ListBookings = () => (
  <List sort={{ field: "id", order: "DESC" }}>
    <Datagrid rowClick="show">
      <TextField source="itsNo" label="ITS No." />
      <TextField source="organiser" label="Organiser" />
      <TextField source="phone" label="Phone" />
      <TextField source="purpose" label="Purpose" />
    </Datagrid>
  </List>
);

export default ListBookings;
