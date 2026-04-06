import { TextInput, Create, SimpleForm } from "react-admin";

export const MohallasCreate = () => (
  <Create>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
      <TextInput source="id" required label="Mohalla Name" fullWidth />
    </SimpleForm>
  </Create>
);
