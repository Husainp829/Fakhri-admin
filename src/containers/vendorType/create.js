import React from "react";
import { TextInput, Create, SimpleForm } from "react-admin";

export default (props) => (
  <Create {...props}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 400 }}>
      <TextInput source="id" isRequired fullWidth />
    </SimpleForm>
  </Create>
);
