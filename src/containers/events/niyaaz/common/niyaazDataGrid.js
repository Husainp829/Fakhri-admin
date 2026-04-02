import React from "react";
import {
  BooleanField,
  Datagrid,
  FunctionField,
  NumberField,
  SimpleList,
  TextField,
} from "react-admin";
import Box from "@mui/material/Box";
import { useMediaQuery } from "@mui/material";

export default () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });
  if (isSmall) {
    return (
      <SimpleList
        primaryText={(record) => record?.formNo || "—"}
        secondaryText={(record) => (
          <>
            HOF {record.HOFId}
            <br />₹{Number(record.takhmeenAmount || 0).toLocaleString("en-IN")} · Paid ₹
            {Number(record.paidAmount || 0).toLocaleString("en-IN")} ·{" "}
            {record?.familyMembers?.length ?? 0} members · Late: {record?.latePayment ? "✅" : "❌"}
          </>
        )}
        tertiaryText={(record) => {
          const name = record?.admin?.name || record?.submitter || "";
          return name ? name.split(" ")[0] : "—";
        }}
        rowSx={() => ({ borderBottom: "1px solid #e0e0e0" })}
      />
    );
  }
  return (
    <Box sx={{ overflowX: "auto", width: "100%" }}>
      <Datagrid bulkActionButtons={false} sx={{ minWidth: 800 }}>
        <FunctionField
          label="Event Name"
          source="event"
          render={(record) => <span>{record?.Event?.name || "-"}</span>}
        />
        <TextField source="formNo" />
        <TextField source="HOFId" label="HOF ID" />
        <NumberField source="takhmeenAmount" />
        <NumberField source="paidAmount" />
        <FunctionField
          label="Members"
          source="familyMembers"
          render={(record) => <span>{record?.familyMembers?.length}</span>}
        />
        <BooleanField
          label="Late Payment"
          source="latePayment"
          render={(record) => <span>{record?.latePayment ? "Yes" : "No"}</span>}
        />
        <FunctionField
          label="Submitter"
          source="submitter"
          render={(record) => <span>{record?.admin?.name || record.submitter || "-"}</span>}
        />
      </Datagrid>
    </Box>
  );
};
