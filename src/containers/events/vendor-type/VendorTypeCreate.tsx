import { TextInput, Create, SimpleForm, type CreateProps } from "react-admin";

export const VendorTypeCreate = (props: CreateProps) => (
  <Create {...props}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 400 }}>
      <TextInput source="id" label="Type" isRequired fullWidth />
    </SimpleForm>
  </Create>
);
