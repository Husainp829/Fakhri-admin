import { Create, SimpleForm, TextInput, type CreateProps } from "react-admin";

export default function FmbVendorCreate(props: CreateProps) {
  return (
    <Create {...props} redirect="list" sx={{ mt: 2 }}>
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
        <TextInput source="name" label="Vendor name" isRequired fullWidth />
        <TextInput source="mobile" label="Mobile" fullWidth />
        <TextInput source="remarks" label="Remarks" fullWidth multiline minRows={2} />
      </SimpleForm>
    </Create>
  );
}
