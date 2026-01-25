import React from "react";
import { Datagrid, TextField, NumberField, FunctionField } from "react-admin";

export default () => (
  <Datagrid bulkActionButtons={false}>
    <FunctionField
      label="Event Name"
      source="event"
      render={(record) => <span>{record?.event?.name || "-"}</span>}
    />
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
      render={(record) => <span>{record?.admin?.name || record.submitter || "-"}</span>}
    />
  </Datagrid>
);
