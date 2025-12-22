import React from "react";
import { Datagrid, DateField, ReferenceField, ReferenceManyField, TextField } from "react-admin";

export default () => (
  <ReferenceManyField reference="sabilTakhmeen" target="sabilId" label={false}>
    <Datagrid>
      <TextField source="takhmeenAmount" />
      <ReferenceField source="updatedBy" reference="admins">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="startDate" />
    </Datagrid>
  </ReferenceManyField>
);
