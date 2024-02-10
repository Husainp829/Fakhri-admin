import React from "react";
import { Datagrid, EditButton, ReferenceManyField, TextField } from "react-admin";

export default () => (
  <ReferenceManyField reference="itsdata" target="HOF_ID" source="itsdata.HOF_ID" label={false}>
    <Datagrid>
      <TextField source="ITS_ID" label="ITS No." />
      <TextField source="HOF_ID" label="HOF" />
      <TextField source="Full_Name" label="Name" />
      <TextField source="Age" label="Age" />
      <TextField source="Gender" label="Gender" />
      <TextField source="Mobile" />
      <EditButton />
    </Datagrid>
  </ReferenceManyField>
);
