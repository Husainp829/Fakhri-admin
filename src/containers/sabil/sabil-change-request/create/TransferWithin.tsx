import { ReferenceInput, AutocompleteInput } from "react-admin";
import Grid from "@mui/material/Grid";

const TransferWithin = () => (
  <Grid container spacing={1} sx={{ mt: 3 }}>
    <Grid
      size={{
        lg: 6,
        xs: 6,
      }}
    >
      <ReferenceInput source="fromITS" reference="itsData" required filter={{ isHOF: true }}>
        <AutocompleteInput label="FROM HOF" optionText="ITS_ID" debounce={300} fullWidth />
      </ReferenceInput>
    </Grid>
    <Grid
      size={{
        lg: 6,
        xs: 6,
      }}
    >
      <ReferenceInput source="toITS" reference="itsData" required>
        <AutocompleteInput label="TO HOF" optionText="ITS_ID" debounce={300} fullWidth />
      </ReferenceInput>
    </Grid>
  </Grid>
);

export default TransferWithin;
