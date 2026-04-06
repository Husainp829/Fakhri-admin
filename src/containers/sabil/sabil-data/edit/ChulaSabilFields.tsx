import { TextInput } from "react-admin";
import Grid from "@mui/material/Grid";

const ChulaSabilEditFields = () => (
  <Grid container spacing={1}>
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

export default ChulaSabilEditFields;
