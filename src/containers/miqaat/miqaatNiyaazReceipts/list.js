import React from "react";
import {
  Datagrid,
  List,
  TextField,
  NumberField,
  DateField,
  FunctionField,
  Button,
  TopToolbar,
  CreateButton,
  SelectInput,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import { dateFilterOptions } from "../../../constants";

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
  </TopToolbar>
);

export default () => {
  const printReceipt = (id) => {
    window.open(`#/mqt-rcpt/${id}`, "_blank");
  };

  const MiqaatNiyaazFilters = [
    <SelectInput
      label="Date Filters"
      source="timePeriod"
      key={1}
      choices={dateFilterOptions}
      alwaysOn
    />,
  ];

  return (
    <List
      sort={{ field: "receiptDate", order: "DESC" }}
      filters={MiqaatNiyaazFilters}
      actions={<ListActions />}
    >
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="name" label="Name" />
        <TextField source="itsNo" label="ITS No." />
        <TextField source="receiptNo" label="Receipt No." />
        <NumberField source="amount" label="Amount" />
        <TextField source="purpose" label="Purpose" />
        <DateField source="receiptDate" label="Receipt Date" />
        <TextField source="paymentMode" label="Payment Mode" />
        <FunctionField
          label="Download"
          render={(record) => (
            <Button onClick={() => printReceipt(record.id)}>
              <DownloadIcon />
            </Button>
          )}
        />
      </Datagrid>
    </List>
  );
};
