import React from "react";
import { TextInput, Create, SimpleForm, Datagrid, TextField, List } from "react-admin";
import Icon from "@mui/icons-material/Receipt";
import NoArrowKeyNumberInput from "../../components/NoArrowKeyNumberInput";

const ListLagatTypes = () => (
  <List sort={{ field: "id", order: "DESC" }}>
    <Datagrid rowClick="show">
      <TextField source="name" label="Name" />
      <TextField source="amount" label="Amount" />
      <TextField source="description" label="Description" />
    </Datagrid>
  </List>
);
const CreateLagatType = () => (
  <Create>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
      <TextInput source="name" required label="Name" fullWidth />
      <NoArrowKeyNumberInput source="amount" required label="Amount" fullWidth />
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
