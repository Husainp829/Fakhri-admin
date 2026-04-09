import type { CreateProps } from "react-admin";
import {
  AutocompleteInput,
  Create,
  PasswordInput,
  ReferenceInput,
  SimpleForm,
  TextInput,
} from "react-admin";
import GroupedPermissionsInput from "@/components/GroupedPermissionsInput";

const AdminCreate = (props: CreateProps) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <PasswordInput source="password" />
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
  </Create>
);

export default AdminCreate;
