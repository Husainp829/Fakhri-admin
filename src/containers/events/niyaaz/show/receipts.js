import React from "react";
import {
  Button,
  Datagrid,
  DateField,
  FunctionField,
  NumberField,
  ReferenceManyField,
  SimpleList,
  TextField,
} from "react-admin";
import Box from "@mui/material/Box";
import { useMediaQuery } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import dayjs from "dayjs";

export default () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });
  return (
    <ReferenceManyField reference="receipts" target="niyaazId" label={false}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.receiptNo}
          secondaryText={(record) => (
            <>
              {record.HOFName} · ₹{Number(record.amount || 0).toLocaleString("en-IN")}
              <br />
              {dayjs(record.date).format("DD/MM/YYYY")} · {record.mode}
            </>
          )}
          tertiaryText={(record) => record.markaz || "—"}
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
