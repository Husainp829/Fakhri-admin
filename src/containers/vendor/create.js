import React from "react";
import { TextInput, Create, SimpleForm, ReferenceInput } from "react-admin";

export default (props) => (
  <Create {...props}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
      <TextInput source="name" isRequired fullWidth />
      <ReferenceInput source="type" reference="vendorTypes" fullWidth />
      <TextInput source="mobile" isRequired fullWidth />
    </SimpleForm>
  </Create>
);
