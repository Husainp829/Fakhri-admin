import { TextInput, Edit, SimpleForm, usePermissions } from "react-admin";
import { hasPermission } from "@/utils/permission-utils";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";

export const SequencesEdit = () => {
  const { permissions } = usePermissions();
  const canEdit = hasPermission(permissions, "sequences.edit");

  if (!canEdit) {
    return <div style={{ padding: 20 }}>You do not have permission to edit sequences.</div>;
  }

  return (
    <Edit mutationMode="optimistic">
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
        <TextInput source="name" label="Name" disabled fullWidth />
        <TextInput source="prefix" label="Prefix" fullWidth />
        <NoArrowKeyNumberInput source="currentValue" label="Current Value" fullWidth />
      </SimpleForm>
    </Edit>
  );
};
