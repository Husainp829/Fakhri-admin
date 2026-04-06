import { Edit, SimpleForm, TextInput } from "react-admin";

export default function MakhsoosItsDataEdit() {
  return (
    <Edit redirect="list">
      <SimpleForm>
        <TextInput source="itsNo" label="ITS number" fullWidth />
      </SimpleForm>
    </Edit>
  );
}
