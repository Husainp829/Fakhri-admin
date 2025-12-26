import React from "react";
import {
  Datagrid,
  List,
  NumberField,
  TextField,
  DateField,
  FunctionField,
  Button,
  usePermissions,
  Pagination,
  TextInput,
  SelectInput,
  DateInput,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import dayjs from "dayjs";
import { exportToExcel } from "../../../utils/exportToExcel";
import { hasPermission } from "../../../utils/permissionUtils";

export default () => {
  const { permissions } = usePermissions();

  const receiptColumns = [
    {
      header: "Receipt No",
      field: "receiptNo",
      width: 15,
    },
    {
      header: "ITS No.",
      field: "organiserIts",
      width: 12,
    },
    {
      header: "Organiser",
      field: "organiser",
      width: 25,
    },
    {
      header: "Date",
      field: "date",
      width: 15,
      formatter: (rec, v) => (v ? dayjs(v).format("DD-MMM-YYYY") : ""),
    },
    {
      header: "Amount",
      field: "amount",
      width: 12,
    },
    {
      header: "Mode",
      field: "mode",
      width: 15,
    },
    {
      header: "Type",
      field: "type",
      width: 15,
    },
    {
      header: "Created By",
      width: 20,
      field: (rec) => rec?.admin?.name || rec.createdBy || "",
    },
    // 🚫 Do NOT export the "Download" button — not relevant in Excel
  ];
  const exporter = (records) =>
    exportToExcel(receiptColumns, records, {
      filenamePrefix: "receipts",
      sheetName: "Receipts",
    });

  const ReceiptFilters = [
    <TextInput
      label="Search By Organiser ITS"
      source="organiserIts"
      alwaysOn
      key={0}
      sx={{ minWidth: 300 }}
    />,
    <DateInput source="start" label="from" alwaysOn key={1} />,
    <DateInput source="end" label="to" alwaysOn key={2} />,
    <SelectInput
      label="Search By Type"
      source="type"
      key={2}
      choices={[
        {
          id: "RENT",
          name: "Rent",
        },
        {
          id: "DEPOSIT",
          name: "Deposit",
        },
      ]}
      alwaysOn
    />,
    <TextInput
      label="Search By Receipt No"
      source="receiptNo"
      key={0}
      sx={{ minWidth: 300 }}
    />,
  ];

  return (
    <List
      hasCreate={false}
      exporter={hasPermission(permissions, "receipts.export") && exporter}
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
        <TextField source="type" />
        <FunctionField
          label="Created By"
          source="createdBy"
          render={(record) => (
            <span>{record?.admin?.name || record.createdBy}</span>
          )}
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
