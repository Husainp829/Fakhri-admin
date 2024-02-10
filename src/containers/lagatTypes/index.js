import React from "react";
import { TextInput, Create, SimpleForm, Datagrid, TextField, List, NumberInput } from "react-admin";
import Icon from "@mui/icons-material/Receipt";

const ListLagatTypes = () => (
  <List sort={{ field: "id", order: "DESC" }}>
    <Datagrid rowClick="show">
      <TextField source="name" label="Mohalla" />
      <TextField source="amount" label="Mohalla" />
      <TextField source="description" label="Mohalla" />
    </Datagrid>
  </List>
);
const CreateLagatType = () => (
  <Create>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
      <TextInput source="name" required label="Name" fullWidth />
      <NumberInput source="amount" required label="Amount" fullWidth />
      <TextInput source="description" required label="Description" fullWidth />
    </SimpleForm>
  </Create>
);

export default {
  list: ListLagatTypes,
  create: CreateLagatType,
  icon: Icon,
  label: "Lagat Types",
  options: { label: "Lagat Types" },
  name: "lagatTypes",
};
