/* eslint-disable no-console */
import React from "react";
import { TextInput, Edit, SimpleForm, CheckboxGroupInput } from "react-admin";
import { permissionsList } from "../../constants";

export default (props) => (
  <Edit {...props} mutationMode="optimistic">
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <CheckboxGroupInput source="permissions" choices={permissionsList} row={false} />
    </SimpleForm>
  </Edit>
);
