import React from "react";
import {
  Datagrid,
  List,
  NumberField,
  TextField,
  DateField,
  FunctionField,
  Button,
  downloadCSV,
  usePermissions,
  Pagination,
  TextInput,
  SelectInput,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import jsonExport from "jsonexport/dist";
import dayjs from "dayjs";

export default () => {
  const { permissions } = usePermissions();
  const exporter = (receipts) => {
    const receiptsForExport = receipts.map((receipt) => {
      const { receiptNo, organiser, organiserIts, date, amount, mode, details, createdBy } =
        receipt;
      return {
        receiptNo,
        organiser,
        organiserIts,
        amount,
        mode,
        details,
        createdBy,
        date: dayjs(date).format("DD/MM/YYYY"),
      };
    });
    jsonExport(
      receiptsForExport,
      {
        headers: [
          "receiptNo",
          "organiser",
          "organiserIts",
          "amount",
          "mode",
          "details",
          "createdBy",
          "date",
        ], // order fields in the export
      },
      (err, csv) => {
        downloadCSV(csv, "receipts"); // download as 'posts.csv` file
      }
    );
  };

  const ReceiptFilters = [
    <TextInput
      label="Search By Organiser ITS"
      source="organiserIts"
      alwaysOn
      key={0}
      sx={{ minWidth: 300 }}
    />,
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
    <TextInput label="Search By Receipt No" source="receiptNo" key={0} sx={{ minWidth: 300 }} />,
  ];

  return (
    <List
      hasCreate={false}
      exporter={permissions?.receipt?.export && exporter}
      pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
      sort={{ field: "date", order: "DESC" }}
      filters={ReceiptFilters}
    >
      <Datagrid rowClick="edit" bulkActionButtons={false}>
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
    </List>
  );
};
