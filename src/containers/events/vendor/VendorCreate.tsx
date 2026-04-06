import { TextInput, Create, SimpleForm, type CreateProps } from "react-admin";

export const VendorCreate = (props: CreateProps) => (
  <Create {...props} redirect="list">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
      <TextInput source="name" isRequired fullWidth />
      <TextInput source="mobile" isRequired fullWidth />
    </SimpleForm>
  </Create>
);
