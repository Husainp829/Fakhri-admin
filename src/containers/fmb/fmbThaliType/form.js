import React from "react";
import { BooleanInput, NumberInput, SimpleForm, TextInput } from "react-admin";
import Grid from "@mui/material/GridLegacy";

const normalizeCode = (value) => (value == null ? value : String(value).trim().toUpperCase());

const validateRequired = (v) => (v == null || String(v).trim() === "" ? "Required" : undefined);

export function FmbThaliTypeForm(props) {
  return (
    <SimpleForm {...props} sx={{ maxWidth: 700 }}>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={6}>
          <TextInput
            source="code"
            label="Code"
            fullWidth
            required
            validate={validateRequired}
            parse={normalizeCode}
            helperText="Unique per tenant, e.g. SMALL / MEDIUM / LARGE"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextInput source="name" label="Name" fullWidth required validate={validateRequired} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <NumberInput source="sortOrder" label="Sort order" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <BooleanInput source="isActive" label="Active" defaultValue />
        </Grid>
      </Grid>
    </SimpleForm>
  );
}
