import React from "react";
import { NumberField, TextField, DateField, FunctionField, Button, Datagrid } from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";

export default () => (
  <Datagrid rowClick={false} bulkActionButtons={false}>
    <TextField source="receiptNo" />
    <TextField source="organiserIts" label="ITS No." />
    <TextField source="organiser" label="Organiser" />
    <DateField source="date" />
    <NumberField source="amount" />
    <TextField source="mode" />
    <FunctionField
      label="Created By"
      source="createdBy"
      render={(record) => <span>{record?.admin?.name || record.createdBy}</span>}
    />
    <FunctionField
      label="Download"
      source="formNo"
      render={(record) => (
        <Button
          onClick={() => {
            window.open(`#/cont-rcpt/${record.id}`, "_blank");
          }}
        >
          <DownloadIcon />
        </Button>
      )}
      key="name"
    />
  </Datagrid>
);
