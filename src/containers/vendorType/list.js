import React from "react";
import { List, Datagrid, TextField } from "react-admin";

export default (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" label="Type" />
    </Datagrid>
  </List>
);
