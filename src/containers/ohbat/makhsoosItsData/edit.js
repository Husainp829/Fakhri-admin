import React from "react";
import { Edit, SimpleForm, TextInput } from "react-admin";

const MakhsoosItsDataEdit = () => (
  <Edit redirect="list">
    <SimpleForm>
      <TextInput source="itsNo" label="ITS number" fullWidth />
    </SimpleForm>
  </Edit>
);

export default MakhsoosItsDataEdit;
