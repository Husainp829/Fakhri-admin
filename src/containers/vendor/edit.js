/* eslint-disable no-console */
import React from "react";
import { TextInput, Edit, SimpleForm } from "react-admin";

export default (props) => (
  <Edit {...props} mutationMode="optimistic">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
      <TextInput source="name" isRequired fullWidth />

      <TextInput source="mobile" isRequired fullWidth />
    </SimpleForm>
  </Edit>
);
