import type { CreateProps } from "react-admin";
import { TextInput, Create, SimpleForm, PasswordInput } from "react-admin";
import GroupedPermissionsInput from "@/components/GroupedPermissionsInput";

const AdminCreate = (props: CreateProps) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <PasswordInput source="password" />
      <GroupedPermissionsInput source="permissions" reference="admins/permissions/available" />
    </SimpleForm>
  </Create>
);

export default AdminCreate;
