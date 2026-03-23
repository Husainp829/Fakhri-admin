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

export default (props) => (
  <Edit {...props}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
      <Grid container spacing={1}>
        <Grid item lg={6} xs={6}>
          <ReferenceInput source="itsNo" reference="itsData" required>
            <ITSInput
              label="ITS No."
              optionText="ITS_ID"
              debounce={300}
              fullWidth
              required
              disabled
            />
          </ReferenceInput>
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput source="name" label="Full name" fullWidth disabled />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput source="itsdata.Area" label="Area (ITS)" fullWidth disabled />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput
            source="itsdata.Sector_Incharge_Name"
            label="Masool (ITS)"
            fullWidth
            disabled
          />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput source="mobileNo" label="Mobile" fullWidth disabled />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput source="mohallah" label="Mohallah / Jamaat" fullWidth disabled />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput source="pan" fullWidth />
        </Grid>
        <Grid item lg={6} xs={6}>
          <DateInput source="lastPaidDate" fullWidth disabled />
        </Grid>
        <Grid item lg={6} xs={6}>
          <NoArrowKeyNumberInput
            source="fmbTakhmeenCurrent.takhmeenAmount"
            label="Current Takhmeen"
            fullWidth
            disabled
          />
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
              required
              debounce={300}
            />
          </ReferenceInput>
        </Grid>
      </Grid>
    </SimpleForm>
  </Edit>
);
