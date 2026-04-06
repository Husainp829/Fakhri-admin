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
  SimpleList,
  TopToolbar,
  FilterButton,
  ExportButton,
  type Exporter,
} from "react-admin";
import { Box, useMediaQuery } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import jsonExport from "jsonexport/dist";
import dayjs from "dayjs";
import { MARKAZ_LIST } from "@/constants";
import { hasPermission } from "@/utils/permission-utils";

export const ReceiptList = () => {
  const { permissions } = usePermissions();
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });
  const exporter: Exporter = (receipts) => {
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
        createdBy: (admin as { name?: string } | undefined)?.name || createdBy,
        date: dayjs(date as string).format("DD/MM/YYYY"),
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
        ],
      },
      (_err, csv) => {
        downloadCSV(csv, "receipts");
      }
    );
  };

  const ReceiptFilters = [
    <TextInput label="Search By HOF ITS" source="HOFId" alwaysOn key={0} sx={{ minWidth: 300 }} />,
    <TextInput label="Search By Receipt No" source="receiptNo" key={1} sx={{ minWidth: 300 }} />,
    <SelectInput
      label="Jaman Venue"
      source="markaz"
      key={2}
      choices={Object.entries(MARKAZ_LIST).map(([id, name]) => ({ id, name }))}
      sx={{ marginBottom: 0 }}
    />,
    <SelectInput
      label="Namaaz Venue"
      source="namaazVenue"
      key={3}
      choices={Object.entries(MARKAZ_LIST).map(([id, name]) => ({ id, name }))}
      sx={{ marginBottom: 0 }}
    />,
  ];

  const ReceiptListActions = () => (
    <TopToolbar>
      <FilterButton />
      {hasPermission(permissions, "receipts.export") && <ExportButton />}
    </TopToolbar>
  );

  return (
    <List
      actions={<ReceiptListActions />}
      exporter={hasPermission(permissions, "receipts.export") ? exporter : undefined}
      pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
      sort={{ field: "date", order: "DESC" }}
      filters={ReceiptFilters}
    >
      {isSmall ? (
        <SimpleList
          primaryText={(record) => String(record.receiptNo)}
          secondaryText={(record) => (
            <>
              {String(record.HOFName)} · {String(record.HOFId)}
              <br />
              {dayjs(record.date as string).format("DD/MM/YYYY")} · ₹
              {Number(record.amount).toLocaleString("en-IN")} · {String(record.mode)}
            </>
          )}
          tertiaryText={(record) => String(record.markaz || "—")}
          linkType="edit"
          rowSx={() => ({ borderBottom: "1px solid #e0e0e0" })}
        />
      ) : (
        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <Datagrid rowClick="edit" bulkActionButtons={false} sx={{ minWidth: 960 }}>
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
        </Box>
      )}
    </List>
  );
};
