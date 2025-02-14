/* eslint-disable no-console */
import React from "react";
import { TextInput, SelectInput, Edit, SimpleForm, ReferenceInput } from "react-admin";

export default (props) => (
  <Edit {...props} mutationMode="optimistic">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
      <TextInput source="name" isRequired fullWidth />
      <ReferenceInput source="type" reference="vendorTypes">
        <SelectInput fullWidth />
      </ReferenceInput>
      <TextInput source="mobile" isRequired fullWidth />
    </SimpleForm>
  </Edit>
);
