import React from "react";
import { Datagrid, TextField, NumberField, FunctionField } from "react-admin";

export default () => (
  <Datagrid bulkActionButtons={false}>
    <TextField source="Event.name" label="Event Name" />
    <TextField source="formNo" />
    <TextField source="HOFId" label="HOF ID" />
    <NumberField source="takhmeenAmount" />
    <NumberField source="paidAmount" />
    <FunctionField
      label="Members"
      source="familyMembers"
      render={(record) => <span>{record?.familyMembers?.length}</span>}
    />
    <FunctionField
      label="Submitter"
      source="submitter"
      render={(record) => <span>{record?.admin?.name || record.submitter}</span>}
    />
  </Datagrid>
);
