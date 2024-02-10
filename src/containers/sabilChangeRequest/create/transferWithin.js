import React from "react";
import { ReferenceInput, AutocompleteInput } from "react-admin";
import Grid from "@mui/material/Grid";

export default () => (
  <Grid container spacing={1} sx={{ mt: 3 }}>
    <Grid item lg={6} xs={6}>
      <ReferenceInput source="fromITS" reference="itsData" required filter={{ isHOF: true }}>
        <AutocompleteInput label="FROM HOF" optionText="ITS_ID" debounce={300} fullWidth required />
      </ReferenceInput>
    </Grid>
    <Grid item lg={6} xs={6}>
      <ReferenceInput source="toITS" reference="itsData" required>
        <AutocompleteInput label="TO HOF" optionText="ITS_ID" debounce={300} fullWidth required />
      </ReferenceInput>
    </Grid>
  </Grid>
);
