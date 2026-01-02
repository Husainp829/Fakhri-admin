import React from "react";
import { TextInput, NumberInput } from "react-admin";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { ManualITSInput } from "./common/manualItsInput";

export default () => (
  <Grid container spacing={1} sx={{ mt: 3 }}>
    <Grid item size={{ xs: 12 }}>
      <Typography variant="body1">Establishment Owner Details</Typography>
    </Grid>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <ManualITSInput source="itsNo" label="ITS No." fullWidth required />
    </Grid>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <TextInput source="name" label="Full Name" fullWidth />
    </Grid>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <TextInput source="address" label="Address" fullWidth />
    </Grid>
    <Grid item size={{ xs: 12 }}>
      <Typography variant="body1">Establishment Details</Typography>
    </Grid>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <TextInput source="firmName" label="Firm Name" fullWidth />
    </Grid>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <TextInput source="firmAddress" label="Firm Address" fullWidth />
    </Grid>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <TextInput source="pan" label="PAN" fullWidth />
    </Grid>
    <Grid item size={{ xs: 12 }}>
      <Typography variant="body1">Sabil Details</Typography>
    </Grid>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <NumberInput source="takhmeen" label="Yearly Takhmeen" fullWidth />
    </Grid>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <TextInput source="remarks" label="Remarks" fullWidth />
    </Grid>
  </Grid>
);
