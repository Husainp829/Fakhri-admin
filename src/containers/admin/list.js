import React from "react";
import { List, Datagrid, TextField, EmailField } from "react-admin";

export default (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="name" />
      <EmailField source="email" />
    </Datagrid>
  </List>
);
