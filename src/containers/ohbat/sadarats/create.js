import React from "react";
import { Create, SimpleForm, TextInput } from "react-admin";

const SadaratCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TextInput
        source="itsNo"
        label="ITS / reference number"
        fullWidth
        helperText="Any reference you use for this sadarat; it is not validated against itsdata."
      />
      <TextInput source="name" fullWidth />
      <TextInput source="mobile" fullWidth />
    </SimpleForm>
  </Create>
);

export default SadaratCreate;
