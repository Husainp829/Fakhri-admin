import React from "react";
import { FunctionField, NumberField, SimpleShowLayout, TextField } from "react-admin";
import { Grid } from "@mui/material";

export default () => (
  <Grid container spacing={2}>
    <Grid item xs={12} sm={3}>
      <SimpleShowLayout>
        <TextField source="formNo" />
        <TextField source="markaz" />
        <TextField source="HOFId" label="ITS NO." />
        <TextField source="HOFName" label="Name" emptyText="-" />
        <TextField source="HOFPhone" label="Phone" />
      </SimpleShowLayout>
    </Grid>
    <Grid item xs={12} sm={4}>
      <SimpleShowLayout>
        <NumberField source="takhmeenAmount" label="Takhmeen" />
        <NumberField source="chairs" label="Chairs" />
        <NumberField source="iftaari" label="Iftaari" />
        <NumberField source="zaibhat" label="Zabihat" />
      </SimpleShowLayout>
    </Grid>
    <Grid item xs={12} sm={4}>
      <SimpleShowLayout>
        <FunctionField
          source="total"
          label="Total Payable"
          render={(record) => (
            <h2>₹ {record.takhmeenAmount + record.chairs + record.iftaari + record.zabihat}</h2>
          )}
        />
        <FunctionField
          source="paidAmount"
          label="Paid Amount"
          render={(record) => <h2>₹ {record.paidAmount}</h2>}
        />
        <FunctionField
          source="pending"
          label="Pending Balance"
          render={(record) => (
            <h2>
              ₹{" "}
              {record.takhmeenAmount +
                record.chairs +
                record.iftaari +
                record.zabihat -
                record.paidAmount}
            </h2>
          )}
        />
      </SimpleShowLayout>
    </Grid>
  </Grid>
);
