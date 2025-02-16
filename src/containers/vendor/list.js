import React from "react";
import { List, Datagrid, TextField, ReferenceField } from "react-admin";

export default (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="name" />
      <TextField source="mobile" />
      <ReferenceField source="updatedBy" reference="admins">
        <TextField source="name" />
      </ReferenceField>
    </Datagrid>
  </List>
);
