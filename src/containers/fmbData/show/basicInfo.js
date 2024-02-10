import React from "react";
import { DateField, NumberField, SimpleShowLayout, TextField } from "react-admin";
import { Grid } from "@mui/material";

export default () => (
  <Grid container spacing={2}>
    <Grid item xs={12} sm={3}>
      <SimpleShowLayout>
        <TextField source="fmbNo" />
        <DateField source="lastPaidDate" emptyText="-" />
        <TextField source="fmbTakhmeenCurrent.takhmeenAmount" label="Takhmeen" />
        <DateField source="fmbTakhmeenCurrent.createdAt" label="Takhmeen Date" />
      </SimpleShowLayout>
    </Grid>
    <Grid item xs={12} sm={4}>
      <SimpleShowLayout>
        <TextField source="itsdata.Full_Name" label="Name" />
        <TextField source="itsdata.ITS_ID" label="ITS No." />
        <TextField source="itsdata.Jamaat" label="Mohalla" />
        <TextField source="address" label="Address" />
        <NumberField source="fmbTakhmeenCurrent.pendingBalance" label="Pending Balance" />
        <NumberField source="fmbTakhmeenCurrent.paidBalance" label="Paid Balance" />
      </SimpleShowLayout>
    </Grid>
  </Grid>
);
