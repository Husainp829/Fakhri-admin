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
  SelectInput,
  TextInput,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import jsonExport from "jsonexport/dist";
import dayjs from "dayjs";
import { MARKAZ_LIST, NAMAAZ_VENUE } from "../../constants";

export default () => {
  const { permissions } = usePermissions();
  const exporter = (receipts) => {
    const receiptsForExport = receipts.map((receipt) => {
      const {
        receiptNo,
        formNo,
        HOFId,
        HOFName,
        date,
        amount,
        mode,
        markaz,
        namaazVenue,
        details,
        admin,
        createdBy,
      } = receipt;
      return {
        receiptNo,
        formNo,
        HOFId,
        HOFName,
        amount,
        mode,
        markaz,
        namaazVenue,
        details,
        createdBy: admin?.name || createdBy,
        date: dayjs(date).format("DD/MM/YYYY"),
      };
    });
    jsonExport(
      receiptsForExport,
      {
        headers: [
          "receiptNo",
          "formNo",
          "HOFId",
          "HOFName",
          "amount",
          "mode",
          "markaz",
          "namaazVenue",
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
    <TextInput label="Search By HOF ITS" source="HOFId" alwaysOn key={0} sx={{ minWidth: 300 }} />,
    <TextInput label="Search By Receipt No" source="receiptNo" key={0} sx={{ minWidth: 300 }} />,
    <SelectInput
      label="Jaman Venue"
      source="markaz"
      key={1}
      choices={Object.entries(MARKAZ_LIST).map(([id, name]) => ({ id, name }))}
      sx={{ marginBottom: 0 }}
    />,
    <SelectInput
      label="Namaaz Venue"
      source="namaazVenue"
      key={1}
      choices={Object.entries(NAMAAZ_VENUE).map(([id, name]) => ({ id, name }))}
      sx={{ marginBottom: 0 }}
    />,
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
        <TextField source="formNo" />
        <TextField source="HOFId" label="HOF ID" />
        <TextField source="HOFName" label="HOF NAME" />
        <DateField source="date" />
        <NumberField source="amount" />
        <TextField source="mode" />
        <TextField source="markaz" />
        <TextField source="namaazVenue" />
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
                window.open(`#/niyaaz-receipt?receiptId=${record.id}`, "_blank");
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
