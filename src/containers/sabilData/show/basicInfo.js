import React from "react";
import { DateField, FunctionField, SimpleShowLayout, TextField } from "react-admin";
import { GridLegacy as Grid } from "@mui/material";

export default () => (
  <Grid container spacing={2}>
    <Grid item xs={12} sm={3}>
      <SimpleShowLayout>
        <TextField source="sabilNo" />
        <TextField source="sabilType" />
        <TextField source="category" />
        <DateField source="lastPaidDate" emptyText="-" />
        <DateField source="sabilTakhmeenCurrent.createdAt" label="Takhmeen Date" />
      </SimpleShowLayout>
    </Grid>
    <Grid item xs={12} sm={4}>
      <SimpleShowLayout>
        <TextField source="itsdata.Full_Name" label="Name" />
        <TextField source="itsdata.ITS_ID" label="ITS No." />
        <TextField source="itsdata.Jamaat" label="Mohalla" />
        <TextField source="address" label="Address" />
      </SimpleShowLayout>
    </Grid>
    <Grid item xs={12} sm={4}>
      <SimpleShowLayout>
        <FunctionField
          source="sabilData.pendingBalance"
          label="Pending Balance"
          render={(record) => <h2>₹ {record.pendingBalance - record.paidBalance}</h2>}
        />
        <TextField source="sabilTakhmeenCurrent.takhmeenAmount" label="Takhmeen" />
      </SimpleShowLayout>
    </Grid>
  </Grid>
);
