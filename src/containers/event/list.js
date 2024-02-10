import React from "react";
import { List, Datagrid, TextField, DateField } from "react-admin";

export default (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="name" />
      <DateField source="fromDate" />
      <DateField source="toDate" />
    </Datagrid>
  </List>
);
