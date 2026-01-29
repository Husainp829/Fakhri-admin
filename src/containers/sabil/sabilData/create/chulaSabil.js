import React from "react";
import { TextInput, DateInput } from "react-admin";
import Grid from "@mui/material/Grid";
import NoArrowKeyNumberInput from "../../../../components/NoArrowKeyNumberInput";

import { ManualITSInput } from "./common/manualItsInput";

export default () => (
  <Grid container spacing={1}>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <ManualITSInput source="itsNo" label="ITS No." fullWidth required />
    </Grid>
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
      <NoArrowKeyNumberInput source="takhmeen" label="Monthly Chula Sabil" fullWidth />
    </Grid>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <DateInput
        source="lastPaidDate"
        label="Last Paid Date"
        fullWidth
        helperText="Cannot be beyond current month. If backdated and takhmeen exists, ledger entries will be created."
      />
    </Grid>
    <Grid item size={{ xs: 12, lg: 6 }}>
      <TextInput source="remarks" label="Remarks" fullWidth />
    </Grid>
  </Grid>
);
