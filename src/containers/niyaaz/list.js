import React from "react";
import { Button, Datagrid, FunctionField, List, NumberField, TextField } from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import { downLoadPasses } from "../../utils";

export default () => (
  <>
    <List>
      <Datagrid rowClick="show">
        <TextField source="formNo" />
        <TextField source="markaz" />
        <TextField source="HOFId" label="HOF ID" />
        <TextField source="HOFName" label="HOF Name" />
        <TextField source="HOFPhone" label="HOF Phone" />
        <NumberField source="takhmeenAmount" />
        <NumberField source="paidAmount" />
        <FunctionField
          label="Submitter"
          source="submitter"
          render={(record) => <span>{record?.admin?.name || record.submitter}</span>}
        />
        <FunctionField
          label="Download"
          source="formNo"
          render={(record) => (
            <Button onClick={() => downLoadPasses(record)}>
              <DownloadIcon />
            </Button>
          )}
          key="name"
        />
      </Datagrid>
    </List>
  </>
);
