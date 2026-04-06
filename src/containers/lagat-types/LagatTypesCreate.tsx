import { TextInput, Create, SimpleForm } from "react-admin";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";

export const LagatTypesCreate = () => (
  <Create>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
      <TextInput source="name" required label="Name" fullWidth />
      <NoArrowKeyNumberInput source="amount" required label="Amount" fullWidth />
      <TextInput source="description" required label="Description" fullWidth />
    </SimpleForm>
  </Create>
);
