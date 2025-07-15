import React from "react";
import { TextInput, Create, SimpleForm, Datagrid, TextField, List } from "react-admin";
import Icon from "@mui/icons-material/Receipt";

const ListMohalla = () => (
  <List sort={{ field: "id", order: "DESC" }}>
    <Datagrid rowClick="show">
      <TextField source="id" label="Purpose" />
    </Datagrid>
  </List>
);
const CreateMohalla = () => (
  <Create>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
      <TextInput source="id" required label="Purpose" fullWidth />
    </SimpleForm>
  </Create>
);

export default {
  list: ListMohalla,
  create: CreateMohalla,
  icon: Icon,
  label: "Purpose",
  options: { label: "Purpose" },
  name: "bookingPurpose",
};
