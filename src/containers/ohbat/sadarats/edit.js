import React from "react";
import { Edit, SimpleForm, TextInput } from "react-admin";

const SadaratEdit = () => (
  <Edit redirect="list">
    <SimpleForm>
      <TextInput
        source="itsNo"
        label="ITS / reference number"
        fullWidth
        helperText="Not validated against itsdata."
      />
      <TextInput source="name" fullWidth />
      <TextInput source="mobile" fullWidth />
    </SimpleForm>
  </Edit>
);

export default SadaratEdit;
