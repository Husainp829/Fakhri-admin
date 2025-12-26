import React from "react";
import { TextInput, Create, SimpleForm, PasswordInput } from "react-admin";
import GroupedPermissionsInput from "../../components/GroupedPermissionsInput";

export default (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <PasswordInput source="password" />
      <GroupedPermissionsInput
        source="permissions"
        reference="admins/permissions/available"
      />
    </SimpleForm>
  </Create>
);
