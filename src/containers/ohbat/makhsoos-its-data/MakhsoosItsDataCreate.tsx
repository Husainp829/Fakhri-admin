import { Create, SimpleForm, TextInput } from "react-admin";

export default function MakhsoosItsDataCreate() {
  return (
    <Create redirect="list">
      <SimpleForm>
        <TextInput source="itsNo" label="ITS number" fullWidth helperText="Must exist in itsdata" />
      </SimpleForm>
    </Create>
  );
}
