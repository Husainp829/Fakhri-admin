import React from "react";
import { Create, SimpleForm, TextInput } from "react-admin";

const MakhsoosItsDataCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TextInput source="itsNo" label="ITS number" fullWidth helperText="Must exist in itsdata" />
    </SimpleForm>
  </Create>
);

export default MakhsoosItsDataCreate;
