import React from "react";
import { BooleanInput, NumberInput, SimpleForm, TextInput } from "react-admin";
import Grid from "@mui/material/Grid";

const normalizeCode = (value: unknown) =>
  value == null ? value : String(value).trim().toUpperCase();

const validateRequired = (v: unknown) =>
  v == null || String(v).trim() === "" ? "Required" : undefined;

type FmbThaliTypeFormProps = Omit<React.ComponentProps<typeof SimpleForm>, "children">;

export function FmbThaliTypeForm(props: FmbThaliTypeFormProps) {
  return (
    <SimpleForm {...props} sx={{ maxWidth: 700 }}>
      <Grid container spacing={1}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
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
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <TextInput source="name" label="Name" fullWidth required validate={validateRequired} />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <NumberInput source="sortOrder" label="Sort order" fullWidth />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <BooleanInput source="isActive" label="Active" defaultValue />
        </Grid>
      </Grid>
    </SimpleForm>
  );
}
