import React from "react";
import { TextInput } from "react-admin";
import Grid from "@mui/material/Grid";

export default () => (
  <Grid container spacing={1}>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <TextInput source="name" label="Full Name" fullWidth />
    </Grid>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <TextInput source="address" label="Address" fullWidth />
    </Grid>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <TextInput source="pan" label="PAN" fullWidth />
    </Grid>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <TextInput source="remarks" label="Remarks" fullWidth />
    </Grid>
  </Grid>
);
