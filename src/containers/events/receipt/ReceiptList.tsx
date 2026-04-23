import {
  Datagrid,
  List,
  NumberField,
  TextField,
  FunctionField,
  Button,
  downloadCSV,
  usePermissions,
  Pagination,
  TextInput,
  SimpleList,
  TopToolbar,
  FilterButton,
  ExportButton,
  type Exporter,
  type RaRecord,
} from "react-admin";
import { Box, useMediaQuery } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import jsonExport from "jsonexport/dist";
import { formatListDate } from "@/utils/date-format";
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
        Remarks: details,
        createdBy: (admin as { name?: string } | undefined)?.name || createdBy,
        date: formatListDate(date as string),
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
          "Remarks",
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
    <TextInput
      source="q"
      label="Search (receipt, form, HOF, amount, mode, venues, remarks, creator…)"
      alwaysOn
      key="q"
      sx={{ minWidth: 320 }}
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
              {formatListDate(record.date as string)} · ₹
              {Number(record.amount).toLocaleString("en-IN")} · {String(record.mode)}
            </>
          )}
          tertiaryText={(record) =>
            [record.markaz, record.details].filter(Boolean).join(" · ") || "—"
          }
          linkType="edit"
          rowSx={() => ({ borderBottom: 1, borderBottomColor: "divider" })}
        />
      ) : (
        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <Datagrid rowClick="edit" bulkActionButtons={false} sx={{ minWidth: 1080 }}>
            <TextField source="receiptNo" />
            <TextField source="formNo" />
            <TextField source="HOFId" label="HOF ID" />
            <TextField source="HOFName" label="HOF NAME" />
            <FunctionField
              label="Date"
              source="date"
              render={(record: RaRecord) =>
                record?.date ? <span>{formatListDate(record.date as string)}</span> : <span>—</span>
              }
            />
            <NumberField source="amount" />
            <TextField source="mode" />
            <TextField source="markaz" />
            <TextField source="namaazVenue" />
            <TextField source="details" label="Remarks" emptyText="—" />
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
