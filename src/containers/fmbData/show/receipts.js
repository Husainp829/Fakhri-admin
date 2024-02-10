import React from "react";
import {
  Button,
  Datagrid,
  DateField,
  FunctionField,
  ReferenceManyField,
  TextField,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";

export default () => {
  const printReceipt = (id) => {
    window.open(`#/fmb-receipt?receiptId=${id}`, "_blank");
  };

  return (
    <ReferenceManyField reference="fmbReceipt" target="fmbId" label={false}>
      <Datagrid>
        <TextField source="receiptNo" label="Receipt No" />
        <TextField source="amount" />
        <DateField source="receiptDate" />
        <TextField source="receiptType" />
        <FunctionField
          label="Download"
          source="formNo"
          render={(record) => (
            <Button onClick={() => printReceipt(record.id)}>
              <DownloadIcon />
            </Button>
          )}
          key="name"
        />
      </Datagrid>
    </ReferenceManyField>
  );
};
