import React from "react";
import { TextInput, Create, SimpleForm, PasswordInput, CheckboxGroupInput } from "react-admin";
import { permissionsList } from "../../constants";

export default (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <PasswordInput source="password" />
      <CheckboxGroupInput
        source="permissions"
        choices={permissionsList}
        row={false}
        defaultValue={permissionsList.filter((p) => p.checked).map((p) => p.id)}
      />
    </SimpleForm>
  </Create>
);
