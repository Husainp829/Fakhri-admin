import React from "react";
import { TextInput, Create, SimpleForm, Datagrid, TextField, List } from "react-admin";
import Icon from "@mui/icons-material/Receipt";

const ListHalls = () => (
  <List sort={{ field: "name", order: "DESC" }}>
    <Datagrid rowClick="show">
      <TextField source="name" label="Name" />
      <TextField source="shortCode" label="ShortCode" />
    </Datagrid>
  </List>
);
const CreateHall = () => (
  <Create>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
      <TextInput source="name" required label="Name" fullWidth />
      <TextInput source="shortCode" required label="Short Code" fullWidth />
    </SimpleForm>
  </Create>
);

export default {
  list: ListHalls,
  create: CreateHall,
  icon: Icon,
  label: "Halls",
  options: { label: "Halls" },
  name: "halls",
};
