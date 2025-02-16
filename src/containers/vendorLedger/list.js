import React from "react";
import { List, Datagrid, TextField, NumberField, DateField, SimpleList } from "react-admin";
import { useMediaQuery } from "@mui/material";

export default (props) => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });
  return (
    <List {...props}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.vendor.name}
          tertiaryText={(record) =>
            `₹ ${Intl.NumberFormat("en-IN").format(Number(record.paid || 0))}`
          }
          secondaryText={(record) => (
            <>
              Bill: {record.billNo} | {new Date(record.billDate).toLocaleDateString()}
              <br />
              Paid: {new Date(record.paidDate).toLocaleDateString()} | {record.mode}
            </>
          )}
          linkType="edit"
          rowSx={() => ({ borderBottom: "1px solid #afafaf" })}
        />
      ) : (
        <Datagrid rowClick="edit">
          <TextField source="ledgerNo" />
          <TextField source="billNo" />
          <TextField source="vendor.name" />
          <TextField source="type" />
          <DateField source="billDate" label="Bill Date" />
          <NumberField source="paid" label="Payment (Rs)" />
          <DateField source="paidDate" label="Payment Date" />
          <TextField source="mode" label="Payment Mode" />
          <TextField source="remarks" label="Remarks" />
        </Datagrid>
      )}
    </List>
  );
};
