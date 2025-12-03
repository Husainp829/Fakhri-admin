import React from "react";
import { TextInput, Create, SimpleForm } from "react-admin";

export default (props) => (
  <Create {...props}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 400 }}>
      <TextInput source="id" label="Type" isRequired fullWidth />
    </SimpleForm>
  </Create>
);
