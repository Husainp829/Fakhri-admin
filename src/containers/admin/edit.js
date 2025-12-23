import React from "react";
import { TextInput, Edit, SimpleForm } from "react-admin";
import GroupedPermissionsInput from "../../components/GroupedPermissionsInput";

export default (props) => (
  <Edit {...props} mutationMode="optimistic">
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <GroupedPermissionsInput
        source="permissions"
        reference="admins/permissions/available"
      />
    </SimpleForm>
  </Edit>
);
