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

export default () => {
  const printReceipt = (id) => {
    window.open(`#/lagat-rcpt/${id}`, "_blank");
  };

  const LagatFilters = [
    <SelectInput
      label="Date Filters"
      source="timePeriod"
      key={1}
      choices={[
        {
          id: "TODAY",
          name: "Today",
        },
        {
          id: "YESTERDAY",
          name: "Yesterday",
        },
        {
          id: "WEEK_TO_DATE",
          name: "Week to Date",
        },
        {
          id: "MONTH_TO_DATE",
          name: "Month to Date",
        },
        {
          id: "YEAR_TO_DATE",
          name: "Year to Date",
        },
        {
          id: "CURRENT_FINANCIAL_YEAR",
          name: "Financial Year",
        },
        {
          id: "LAST_7_DAYS",
          name: "Last 7 Days",
        },
        {
          id: "LAST_30_DAYS",
          name: "Last 30 Days",
        },
        {
          id: "LAST_90_DAYS",
          name: "Last 90 Days",
        },
        {
          id: "LAST_180_DAYS",
          name: "Last 180 Days",
        },
        {
          id: "LAST_365_DAYS",
          name: "Last 365 Days",
        },
      ]}
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
