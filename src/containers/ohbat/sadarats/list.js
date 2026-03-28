import React from "react";
import { Datagrid, List, TextField, EditButton } from "react-admin";

const SadaratList = () => (
  <List sort={{ field: "name", order: "ASC" }} perPage={25}>
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="itsNo" label="ITS" />
      <TextField source="name" />
      <TextField source="mobile" />
      <EditButton />
    </Datagrid>
  </List>
);

export default SadaratList;
