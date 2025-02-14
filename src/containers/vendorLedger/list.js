import React from "react";
import { List, Datagrid, TextField, ReferenceField, NumberField, DateField } from "react-admin";

export default (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <ReferenceField source="vendorId" reference="vendors">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="type" />
      <NumberField source="paid" label="Payment (Rs)" />
      <TextField source="mode" label="Payment Mode" />
      <DateField source="date" label="Payment Date" />
      <TextField source="remarks" label="Remarks" />
    </Datagrid>
  </List>
);
