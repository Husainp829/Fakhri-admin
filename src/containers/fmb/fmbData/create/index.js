import React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  DateInput,
  AutocompleteInput,
} from "react-admin";
import Grid from "@mui/material/GridLegacy";
import NoArrowKeyNumberInput from "../../../../components/NoArrowKeyNumberInput";

import { ITSInput } from "../common/itsInput";

const transform = (data) => {
  const next = { ...data };
  if (!next.deliveryScheduleProfileId) {
    delete next.deliveryScheduleProfileId;
  }
  return next;
};

export default (props) => (
  <Create {...props} transform={transform}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
      <Grid container spacing={1}>
        <Grid item lg={6} xs={6}>
          <ReferenceInput source="itsNo" reference="itsData" required>
            <ITSInput label="ITS No." optionText="ITS_ID" debounce={300} fullWidth required />
          </ReferenceInput>
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput source="name" label="Full name" fullWidth />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput source="area" label="Area (ITS)" fullWidth />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput source="masool" label="Masool (ITS)" fullWidth />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput source="mobileNo" label="Mobile (ITS)" fullWidth />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput source="mohallah" label="Mohallah / Jamaat (ITS)" fullWidth />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput source="pan" fullWidth />
        </Grid>
        <Grid item lg={6} xs={6}>
          <DateInput source="lastPaidDate" fullWidth />
        </Grid>
        <Grid item lg={6} xs={6}>
          <NoArrowKeyNumberInput source="takhmeen" label="Takhmeen Amount" fullWidth />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput source="remarks" label="Remarks" fullWidth />
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
              debounce={300}
              helperText="Optional — defaults to tenant DEFAULT profile when omitted"
            />
          </ReferenceInput>
        </Grid>
      </Grid>
    </SimpleForm>
  </Create>
);
