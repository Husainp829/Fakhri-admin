/* eslint-disable no-console */
import React from "react";
import { TextInput, Edit, SimpleForm } from "react-admin";

export default (props) => (
  <Edit {...props} mutationMode="optimistic">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 400 }}>
      <TextInput source="id" label="Type" isRequired fullWidth />
    </SimpleForm>
  </Edit>
);
