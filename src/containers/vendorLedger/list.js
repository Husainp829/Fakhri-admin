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
          secondaryText={(record) =>
            `${new Date(record.date).toLocaleDateString()} | ${record.mode}`
          }
          linkType="edit"
          rowSx={() => ({ borderBottom: "1px solid #afafaf" })}
        />
      ) : (
        <Datagrid rowClick="edit">
          <TextField source="vendor.name" />
          <TextField source="type" />
          <NumberField source="paid" label="Payment (Rs)" />
          <TextField source="mode" label="Payment Mode" />
          <DateField source="date" label="Payment Date" />
          <TextField source="remarks" label="Remarks" />
        </Datagrid>
      )}
    </List>
  );
};
