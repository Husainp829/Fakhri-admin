import React from "react";
import { TextInput, Create, SimpleForm } from "react-admin";

export default (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);
