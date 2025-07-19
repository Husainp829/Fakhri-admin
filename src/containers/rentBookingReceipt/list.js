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
