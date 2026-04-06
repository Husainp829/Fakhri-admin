import type { EditProps } from "react-admin";
import { TextInput, Edit, SimpleForm } from "react-admin";
import GroupedPermissionsInput from "@/components/GroupedPermissionsInput";

const AdminEdit = (props: EditProps) => (
  <Edit {...props} mutationMode="optimistic">
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <GroupedPermissionsInput source="permissions" reference="admins/permissions/available" />
    </SimpleForm>
  </Edit>
);

export default AdminEdit;
