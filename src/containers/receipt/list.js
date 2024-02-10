import React from "react";
import { Datagrid, List, NumberField, TextField, DateField, FunctionField, Button } from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import { downloadReceipts } from "../../utils";

export default () => (
  <>
    <List>
      <Datagrid rowClick="edit">
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
            <Button onClick={() => downloadReceipts(record)}>
              <DownloadIcon />
            </Button>
          )}
          key="name"
        />
      </Datagrid>
    </List>
  </>
);
