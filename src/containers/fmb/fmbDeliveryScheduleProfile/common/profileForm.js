import React from "react";
import {
  SimpleForm,
  TextInput,
  SelectArrayInput,
  NumberInput,
  Toolbar,
  SaveButton,
  DeleteButton,
} from "react-admin";
import Grid from "@mui/material/GridLegacy";
import { Alert, Typography } from "@mui/material";
import { FMB_ISO_WEEKDAY_CHOICES } from "../../fmbIsoWeekdayChoices";

const nullIfEmptyNumber = (v) => (v === "" || v === undefined ? null : v);

const ProfileFormToolbar = () => (
  <Toolbar>
    <SaveButton />
    <DeleteButton mutationMode="pessimistic" confirmTitle="Delete this profile?" />
  </Toolbar>
);

export function ProfileForm({ toolbar = <ProfileFormToolbar />, ...rest }) {
  return (
    <SimpleForm {...rest} toolbar={toolbar} warnWhenUnsavedChanges sx={{ maxWidth: 720 }}>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={6}>
          <TextInput
            source="code"
            fullWidth
            required
            helperText="Unique per tenant (e.g. DEFAULT, BARAKAT_FRIDAY)"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextInput source="name" fullWidth required />
        </Grid>
        <Grid item xs={12}>
          <SelectArrayInput
            source="deliveryWeekdays"
            choices={FMB_ISO_WEEKDAY_CHOICES}
            optionText="name"
            optionValue="id"
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <NumberInput
            source="cutoffOffsetDays"
            fullWidth
            min={0}
            helperText="Leave empty for tenant default. 0 = midnight on the service day."
            parse={nullIfEmptyNumber}
            format={(v) => (v === null || v === undefined ? "" : v)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <NumberInput
            source="cutoffMinutes"
            fullWidth
            min={0}
            max={1439}
            helperText="Leave empty for tenant default. Minutes after that day’s local midnight (0–1439)."
            parse={nullIfEmptyNumber}
            format={(v) => (v === null || v === undefined ? "" : v)}
          />
        </Grid>
        <Grid item xs={12}>
          <Alert severity="info" variant="outlined">
            <Typography variant="body2" component="div">
              <strong>Example:</strong> Wednesday service, offset <strong>1</strong> day,{" "}
              <strong>120</strong> minutes → cut-off <strong>Tuesday 2:00 AM</strong> local. Same
              service day with offset <strong>0</strong> and <strong>630</strong> minutes →{" "}
              <strong>Wednesday 10:30 AM</strong> local. Empty fields use defaults from Thali
              settings.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </SimpleForm>
  );
}
