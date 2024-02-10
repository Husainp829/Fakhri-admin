import React from "react";
import { ArrayField, Datagrid, TextField } from "react-admin";

export default () => (
  <ArrayField source="familyMembers">
    <Datagrid bulkActionButtons={false}>
      <TextField source="name" />
      <TextField source="age" />
      <TextField source="its" label="ITS" />
      <TextField source="gender" />
    </Datagrid>
  </ArrayField>
);
