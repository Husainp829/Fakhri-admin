import React from "react";
import { SimpleForm, DateInput, TextInput, Toolbar, SaveButton, DeleteButton } from "react-admin";
import Grid from "@mui/material/Grid";

const EditToolbar = () => (
  <Toolbar>
    <SaveButton />
    <DeleteButton mutationMode="pessimistic" confirmTitle="Remove this holiday?" />
  </Toolbar>
);

const CreateToolbar = () => (
  <Toolbar>
    <SaveButton />
  </Toolbar>
);

export function HolidayForm({ isEdit }: { isEdit?: boolean }) {
  return (
    <SimpleForm
      toolbar={isEdit ? <EditToolbar /> : <CreateToolbar />}
      warnWhenUnsavedChanges
      sx={{ maxWidth: 560 }}
    >
      <Grid container spacing={1}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <DateInput source="holidayDate" fullWidth required label="Date (no delivery)" />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <TextInput
            source="name"
            fullWidth
            label="Label (optional)"
            helperText="e.g. Eid, Ashura"
          />
        </Grid>
      </Grid>
    </SimpleForm>
  );
}
