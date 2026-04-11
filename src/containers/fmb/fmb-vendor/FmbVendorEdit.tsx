import { Edit, SimpleForm, TextInput, type EditProps } from "react-admin";

export default function FmbVendorEdit(props: EditProps) {
  return (
    <Edit {...props} mutationMode="optimistic">
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
        <TextInput source="name" label="Vendor name" isRequired fullWidth />
        <TextInput source="mobile" label="Mobile" fullWidth />
        <TextInput source="remarks" label="Remarks" fullWidth multiline minRows={2} />
      </SimpleForm>
    </Edit>
  );
}
