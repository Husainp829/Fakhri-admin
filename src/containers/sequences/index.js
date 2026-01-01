import React from "react";
import {
  TextInput,
  Edit,
  SimpleForm,
  Datagrid,
  TextField,
  List,
  NumberInput,
  usePermissions,
} from "react-admin";
import Icon from "@mui/icons-material/Filter9Plus";
import { hasPermission } from "../../utils/permissionUtils";

const ListSequences = () => {
  const { permissions } = usePermissions();
  const canEdit = hasPermission(permissions, "sequences.edit");

  return (
    <List sort={{ field: "name", order: "ASC" }}>
      <Datagrid rowClick={canEdit ? "edit" : false}>
        <TextField source="name" label="Name" />
        <TextField source="prefix" label="Prefix" />
        <TextField source="currentValue" label="Current Value" />
      </Datagrid>
    </List>
  );
};

const EditSequence = () => {
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
        <NumberInput source="currentValue" label="Current Value" fullWidth />
      </SimpleForm>
    </Edit>
  );
};

export default {
  list: ListSequences,
  edit: EditSequence,
  icon: Icon,
  label: "Sequences",
  options: { label: "Sequences" },
  name: "sequences",
};
