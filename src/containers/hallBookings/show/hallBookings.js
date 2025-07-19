import React from "react";
import {
  Datagrid,
  DateField,
  NumberField,
  ReferenceField,
  ReferenceManyField,
  TextField,
} from "react-admin";

export default () => (
  <ReferenceManyField reference="hallBookings" target="bookingId" label={false}>
    <Datagrid>
      <ReferenceField source="hallId" reference="halls">
        <TextField source="name" />
      </ReferenceField>
      <NumberField source="thaals" />
      <DateField source="date" />
      <TextField source="slot" />
    </Datagrid>
  </ReferenceManyField>
);
