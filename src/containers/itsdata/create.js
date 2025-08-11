import React from "react";
import Grid from "@mui/material/GridLegacy";
import Typography from "@mui/material/Typography";
import {
  Create,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
  maxValue,
  number,
  regex,
} from "react-admin";

const validateMobile = regex(
  /^(\+91)[6789]\d{9}$/,
  "Must be a valid phone number (Eg. +919123456789 )"
);
const validateEmail = regex(
  /^[^\W_]+\w*(?:[.-]\w*)*[^\W_]+@[^\W_]+(?:[.-]?\w*[^\W_]+)*(?:\.[^\W_]{2,})/,
  "Must be a valid Email (Eg. abc@xyz.com )"
);

const validateIts = [number(), maxValue(99999999, "Must be a valid ITS No. (Eg. 12345678 )")];
const validateAge = [number(), maxValue(200, "Invalid Age entered")];
const validatePincode = [number(), maxValue(999999, "Invalid Pincode entered")];

export default () => (
  <Create>
    <SimpleForm sx={{ maxWidth: 700 }} mode="onBlur" reValidateMode="onBlur">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="body1">ITS Details</Typography>
        </Grid>
        <Grid item lg={6}>
          <TextInput source="ITS_ID" validate={validateIts} label="ITS No." fullWidth required />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">Personal Details</Typography>
        </Grid>
        <Grid item lg={12}>
          <TextInput source="Full_Name" fullWidth required />
        </Grid>
        <Grid item lg={6}>
          <TextInput source="Age" fullWidth required validate={validateAge} />
        </Grid>
        <Grid item lg={6}>
          <SelectInput
            source="Gender"
            fullWidth
            required
            choices={[
              { id: "Male", name: "Male" },
              { id: "Female", name: "Female" },
            ]}
            sx={{ marginTop: 0 }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">Contact Details</Typography>
        </Grid>
        <Grid item lg={6}>
          <TextInput source="Mobile" validate={validateMobile} fullWidth required />
        </Grid>
        <Grid item lg={6}>
          <TextInput source="Email" validate={validateEmail} fullWidth required />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body1">Address Details</Typography>
        </Grid>

        <Grid item lg={6}>
          <TextInput source="Address" fullWidth required />
        </Grid>
        <Grid item lg={6}>
          <TextInput source="City" fullWidth required />
        </Grid>
        <Grid item lg={6}>
          <TextInput source="State" fullWidth required />
        </Grid>
        <Grid item lg={6}>
          <TextInput source="Pincode" fullWidth required validate={validatePincode} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">Jamaat Details</Typography>
        </Grid>
        <Grid item lg={12}>
          <ReferenceInput
            source="Jamaat"
            reference="mohallas"
            required
            perPage={999}
            sort={{ field: "createdAt", order: "ASC" }}
          >
            <SelectInput label="Jamaat" optionText="id" debounce={300} fullWidth required />
          </ReferenceInput>
        </Grid>
      </Grid>
    </SimpleForm>
  </Create>
);
