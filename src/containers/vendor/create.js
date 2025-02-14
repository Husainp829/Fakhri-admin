import React from "react";
import { TextInput, Create, SimpleForm } from "react-admin";

export default (props) => (
  <Create {...props}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
      <TextInput source="name" isRequired fullWidth />
      <TextInput source="mobile" isRequired fullWidth />
    </SimpleForm>
  </Create>
);
