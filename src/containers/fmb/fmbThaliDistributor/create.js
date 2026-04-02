import React from "react";
import { BooleanInput, Create, SimpleForm, TextInput } from "react-admin";

export default function FmbThaliDistributorCreate(props) {
  return (
    <Create {...props} title="Create thali distributor">
      <SimpleForm>
        <TextInput source="code" fullWidth />
        <TextInput source="name" fullWidth />
        <TextInput source="phone" fullWidth />
        <BooleanInput source="isActive" defaultValue />
        <TextInput source="remarks" fullWidth multiline />
      </SimpleForm>
    </Create>
  );
}
