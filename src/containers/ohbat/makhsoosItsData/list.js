import React from "react";
import { Datagrid, DateField, List, TextField, EditButton } from "react-admin";

const MakhsoosItsDataList = () => (
  <List sort={{ field: "itsNo", order: "ASC" }} perPage={50}>
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="itsNo" label="ITS" />
      <DateField source="createdAt" label="Marked on" />
      <EditButton />
    </Datagrid>
  </List>
);

export default MakhsoosItsDataList;
