import { TextInput, Edit, SimpleForm, type EditProps } from "react-admin";

export const VendorTypeEdit = (props: EditProps) => (
  <Edit {...props} mutationMode="optimistic">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 400 }}>
      <TextInput source="id" label="Type" isRequired fullWidth />
    </SimpleForm>
  </Edit>
);
