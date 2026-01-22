import React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  EditButton,
  DeleteButton,
} from "react-admin";

export default (props) => (
  <List {...props} sort={{ field: "fromDate", order: "DESC" }}>
    <Datagrid rowClick="edit">
      <TextField source="name" />
      <TextField source="hijriYear" label="Hijri Year" />
      <TextField source="slug" />
      <DateField source="fromDate" label="From Date" />
      <DateField source="toDate" label="To Date" />
      <NumberField source="zabihat" label="Zabihat" />
      <NumberField source="chairs" label="Chairs" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
