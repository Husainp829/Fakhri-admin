import React from "react";
import {
  Button,
  Datagrid,
  DateField,
  FunctionField,
  NumberField,
  ReferenceManyField,
  TextField,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";

export default () => (
  <ReferenceManyField reference="receipts" target="niyaazId" label={false}>
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="receiptNo" />
      <TextField source="formNo" />
      <TextField source="HOFId" label="HOF ID" />
      <TextField source="HOFName" label="HOF NAME" />
      <DateField source="date" />
      <NumberField source="amount" />
      <TextField source="mode" />
      <TextField source="markaz" />
      <NumberField source="total" />
      <FunctionField
        label="Download"
        source="formNo"
        render={(record) => (
          <Button
            onClick={() => {
              window.open(`#/niyaaz-receipt?receiptId=${record.id}`, "_blank");
            }}
          >
            <DownloadIcon />
          </Button>
        )}
        key="name"
      />
    </Datagrid>
  </ReferenceManyField>
);
