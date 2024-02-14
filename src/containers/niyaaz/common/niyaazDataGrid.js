import React from "react";
import { Datagrid, TextField, NumberField, FunctionField } from "react-admin";

export default () => (
  <Datagrid bulkActionButtons={false}>
    <TextField source="event.name" label="Event Name" />
    <TextField source="formNo" />
    <TextField source="markaz" />
    <TextField source="HOFId" label="HOF ID" />
    <NumberField source="takhmeenAmount" />
    <NumberField source="paidAmount" />
    <FunctionField
      label="Submitter"
      source="submitter"
      render={(record) => <span>{record?.admin?.name || record.submitter}</span>}
    />
  </Datagrid>
);
