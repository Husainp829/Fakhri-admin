import { Datagrid, TextField, List, usePermissions } from "react-admin";
import { hasPermission } from "@/utils/permission-utils";

export const SequencesList = () => {
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
