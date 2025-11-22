import React from "react";
import {
  Datagrid,
  List,
  TextField,
  DateField,
  FunctionField,
  Button,
  SelectInput,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import { dateFilterOptions } from "../../constants";

export default () => {
  const printReceipt = (id) => {
    window.open(`#/lagat-rcpt/${id}`, "_blank");
  };

  const LagatFilters = [
    <SelectInput
      label="Date Filters"
      source="timePeriod"
      key={1}
      choices={dateFilterOptions}
      alwaysOn
    />,
  ];
  return (
    <>
      <List sort={{ field: "receiptNo", order: "DESC" }} filters={LagatFilters}>
        <Datagrid rowClick="show" bulkActionButtons={false}>
          <TextField source="name" />
          <TextField source="itsNo" label="ITS No." />
          <TextField source="receiptNo" />
          <TextField source="amount" />
          <TextField source="purpose" />
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
