import React from "react";
import {
  Datagrid,
  List,
  TextField,
  DateField,
  FunctionField,
  Button,
  ReferenceField,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";

export default () => {
  const printReceipt = (id) => {
    window.open(`#/sabil-receipt?receiptId=${id}`, "_blank");
  };
  return (
    <>
      <List sort={{ field: "receiptNo", order: "DESC" }}>
        <Datagrid rowClick="show">
          <TextField source="receiptNo" />
          <ReferenceField source="sabilId" reference="sabilData" link="show">
            <TextField source="sabilNo" />
          </ReferenceField>
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
      </List>
    </>
  );
};
