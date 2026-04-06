import { BooleanInput, Create, SimpleForm, TextInput, type CreateProps } from "react-admin";

export default function FmbThaliDistributorCreate(props: CreateProps) {
  return (
    <Create {...props} title="Create thali distributor">
      <SimpleForm>
        <TextInput source="code" fullWidth />
        <TextInput source="name" fullWidth />
        <TextInput source="phone" fullWidth />
        <BooleanInput source="isActive" defaultValue />
        <TextInput source="remarks" fullWidth multiline />
      </SimpleForm>
    </Create>
  );
}
