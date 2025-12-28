import React from "react";
import { Datagrid, List, TextField, ShowButton } from "react-admin";

const BookingPurposeList = () => (
  <List sort={{ field: "id", order: "ASC" }}>
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="id" label="Purpose ID" />
      <TextField source="name" label="Name" />
      <ShowButton />
    </Datagrid>
  </List>
);

export default BookingPurposeList;
