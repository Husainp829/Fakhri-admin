import React from "react";
import { SimpleForm, DateInput, TextInput, Toolbar, SaveButton, DeleteButton } from "react-admin";
import Grid from "@mui/material/GridLegacy";

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

export function HolidayForm({ isEdit }) {
  return (
    <SimpleForm
      toolbar={isEdit ? <EditToolbar /> : <CreateToolbar />}
      warnWhenUnsavedChanges
      sx={{ maxWidth: 560 }}
    >
      <Grid container spacing={1}>
        <Grid item xs={12} sm={6}>
          <DateInput source="holidayDate" fullWidth required label="Date (no delivery)" />
        </Grid>
        <Grid item xs={12} sm={6}>
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
