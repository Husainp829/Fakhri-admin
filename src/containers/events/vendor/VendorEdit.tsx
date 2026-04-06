import { TextInput, Edit, SimpleForm, type EditProps } from "react-admin";

export const VendorEdit = (props: EditProps) => (
  <Edit {...props} mutationMode="optimistic">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
      <TextInput source="name" isRequired fullWidth />
      <TextInput source="mobile" isRequired fullWidth />
    </SimpleForm>
  </Edit>
);
