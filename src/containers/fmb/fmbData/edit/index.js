import React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  DateInput,
  AutocompleteInput,
} from "react-admin";
import Grid from "@mui/material/GridLegacy";
import { ITSInput } from "../common/itsInput";
import NoArrowKeyNumberInput from "../../../../components/NoArrowKeyNumberInput";
import { ThaliFieldsInput, mapThaliRowForApi } from "../common/thaliFields";

const transform = (data) => {
  const next = { ...data };
  // The FMB "current takhmeen" is managed via the takhmeen module, not via FMB edit.
  // Ensure we never send takhmeen fields (or legacy aliases) to avoid DTO validation on empty strings.
  delete next.takhmeen;
  delete next.takhmeenAmount;
  delete next.takhmeenYear;
  delete next.fmbTakhmeenCurrent;

  if (Array.isArray(next.thalis)) {
    next.thalis = next.thalis
      .filter((thali) => thali?.thaliNo && String(thali.thaliNo).trim())
      .map((thali) => mapThaliRowForApi(thali, { isCreate: false }));
  }
  return next;
};

export default (props) => (
  <Edit {...props} transform={transform}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ReferenceInput source="itsNo" reference="itsData" required>
            <ITSInput
              label="ITS No."
              optionText={(r) => `${r.ITS_ID} · ${r.Full_Name}`}
              debounce={300}
              fullWidth
              required
              disabled
            />
          </ReferenceInput>
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <TextInput source="area" label="Area (ITS)" fullWidth disabled />
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <TextInput source="masool" label="Masool (ITS)" fullWidth disabled />
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <TextInput source="mobileNo" label="Mobile" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <TextInput source="pan" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <CurrentTakhmeenAmountInput />
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <DateInput source="lastPaidDate" label="Last paid date" fullWidth disabled />
        </Grid>
        <Grid item xs={12}>
          <TextInput source="remarks" label="Remarks" fullWidth minRows={3} multiline />
        </Grid>
        <Grid item xs={12}>
          <ReferenceInput
            source="deliveryScheduleProfileId"
            reference="fmbDeliveryScheduleProfile"
            perPage={100}
            label="Delivery schedule profile"
          >
            <AutocompleteInput
              optionText={(r) => `${r.code} — ${r.name}`}
              fullWidth
              required
              debounce={300}
            />
          </ReferenceInput>
        </Grid>
        <Grid item xs={12}>
          <ThaliFieldsInput />
        </Grid>
      </Grid>
    </SimpleForm>
  </Edit>
);

function CurrentTakhmeenAmountInput() {
  // react-admin exposes the current record values as form fields; use the field values directly.
  // (No hooks here to keep this component safe in any render context.)
  return (
    <NoArrowKeyNumberInput
      source="fmbTakhmeenCurrent.takhmeenAmount"
      label="Current Takhmeen"
      fullWidth
      disabled
      helperText={
        // react-admin doesn't support dynamic helperText via source binding; keep this stable.
        "To change takhmeen, use the Takhmeen section/module."
      }
    />
  );
}
