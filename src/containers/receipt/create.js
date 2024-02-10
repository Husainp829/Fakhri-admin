import React from "react";
import { TextInput, Create, SimpleForm, PasswordInput } from "react-admin";

export default (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <PasswordInput source="password" />
    </SimpleForm>
  </Create>
);
