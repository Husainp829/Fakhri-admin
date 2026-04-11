import type { EditProps } from "react-admin";
import { AutocompleteInput, Edit, ReferenceInput, SimpleForm, TextInput } from "react-admin";
import GroupedPermissionsInput from "@/components/GroupedPermissionsInput";

const AdminEdit = (props: EditProps) => (
  <Edit {...props} mutationMode="optimistic">
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <ReferenceInput
        source="fmbThaliDistributorId"
        reference="fmbThaliDistributor"
        label="Linked thali distributor (portal)"
        helperText="Optional. For the FMB distributor self-service portal; only one admin per distributor."
      >
        <AutocompleteInput optionText={(r) => `${r.code} — ${r.name}`} />
      </ReferenceInput>
      <GroupedPermissionsInput source="permissions" reference="admins/permissions/available" />
    </SimpleForm>
  </Edit>
);

export default AdminEdit;
