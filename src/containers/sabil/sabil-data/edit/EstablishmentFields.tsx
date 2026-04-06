import { TextInput } from "react-admin";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const EstablishmentEditFields = () => (
  <Grid container spacing={1} sx={{ mt: 3 }}>
    <Grid size={12}>
      <Typography variant="body1">Establishment Owner Details</Typography>
    </Grid>
    <Grid
      size={{
        xs: 12,
        lg: 6,
      }}
    >
      <TextInput source="name" label="Full Name" fullWidth />
    </Grid>
    <Grid
      size={{
        xs: 12,
        lg: 6,
      }}
    >
      <TextInput source="address" label="Address" fullWidth />
    </Grid>
    <Grid size={12}>
      <Typography variant="body1">Establishment Details</Typography>
    </Grid>
    <Grid
      size={{
        xs: 12,
        lg: 6,
      }}
    >
      <TextInput source="firmName" label="Firm Name" fullWidth />
    </Grid>
    <Grid
      size={{
        xs: 12,
        lg: 6,
      }}
    >
      <TextInput source="firmAddress" label="Firm Address" fullWidth />
    </Grid>
    <Grid
      size={{
        xs: 12,
        lg: 6,
      }}
    >
      <TextInput source="pan" label="PAN" fullWidth />
    </Grid>
    <Grid
      size={{
        xs: 12,
        lg: 6,
      }}
    >
      <TextInput source="remarks" label="Remarks" fullWidth />
    </Grid>
  </Grid>
);

export default EstablishmentEditFields;
