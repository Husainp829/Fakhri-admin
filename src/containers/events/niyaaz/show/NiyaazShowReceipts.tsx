import {
  Button,
  Datagrid,
  FunctionField,
  NumberField,
  ReferenceManyField,
  SimpleList,
  TextField,
  type RaRecord,
} from "react-admin";
import Box from "@mui/material/Box";
import { useMediaQuery } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { formatListDate } from "@/utils/date-format";

export const NiyaazShowReceipts = () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });
  return (
    <ReferenceManyField reference="receipts" target="niyaazId" label={false}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => String(record.receiptNo)}
          secondaryText={(record) => (
            <>
              {String(record.HOFName)} · ₹{Number(record.amount || 0).toLocaleString("en-IN")}
              <br />
              {formatListDate(record.date)} · {String(record.mode)}
            </>
          )}
          tertiaryText={(record) => String(record.markaz || "—")}
          linkType="edit"
          rowSx={() => ({ borderBottom: 1, borderBottomColor: "divider" })}
        />
      ) : (
        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <Datagrid rowClick="edit" bulkActionButtons={false} sx={{ minWidth: 960 }}>
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
            <NumberField source="total" />
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
    </ReferenceManyField>
  );
};
