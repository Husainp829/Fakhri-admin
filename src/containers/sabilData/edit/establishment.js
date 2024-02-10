import React from "react";
import { TextInput, ReferenceInput, DateInput, NumberInput } from "react-admin";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { ITSInput } from "../common/itsInput";

export default () => (
  <Grid container spacing={1} sx={{ mt: 3 }}>
    <Grid item xs={12}>
      <Typography variant="body1">Establishment Owner Details</Typography>
    </Grid>
    <Grid item lg={6} xs={6}>
      <ReferenceInput source="itsNo" reference="itsData" required>
        <ITSInput label="ITS No." optionText="ITS_ID" debounce={300} fullWidth required disabled />
      </ReferenceInput>
    </Grid>
    <Grid item lg={6} xs={6}>
      <TextInput source="name" label="Full Name" fullWidth disabled />
    </Grid>
    <Grid item lg={6} xs={6}>
      <TextInput source="area" fullWidth disabled />
    </Grid>
    <Grid item lg={6} xs={6}>
      <TextInput source="masool" fullWidth disabled />
    </Grid>
    <Grid item lg={6} xs={12}>
      <TextInput source="mobile" fullWidth disabled />
    </Grid>
    <Grid item lg={6} xs={6}>
      <TextInput source="mohallah" fullWidth disabled />
    </Grid>
    <Grid item lg={6} xs={6}>
      <TextInput source="pan" fullWidth />
    </Grid>
    <Grid item xs={12}>
      <Typography variant="body1">ITS Details</Typography>
    </Grid>

    <Grid item xs={12}>
      <Typography variant="body1">Establishment Details</Typography>
    </Grid>
    <Grid item lg={6} xs={6}>
      <TextInput source="firmName" fullWidth />
    </Grid>
    <Grid item lg={6} xs={6}>
      <TextInput source="address" fullWidth />
    </Grid>
    <Grid item xs={12}>
      <Typography variant="body1">Sabil Details</Typography>
    </Grid>
    <Grid item lg={6} xs={6}>
      <DateInput source="lastPaidDate" fullWidth />
    </Grid>
    <Grid item lg={6} xs={6}>
      <NumberInput
        source="sabilTakhmeenCurrent.takhmeenAmount"
        label="Current Takhmeen"
        fullWidth
        disabled
      />
    </Grid>
    <Grid item lg={6} xs={6}>
      <TextInput source="Remarks" fullWidth />
    </Grid>
  </Grid>
);
