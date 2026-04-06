import { Datagrid, TextField, List } from "react-admin";

export const LagatTypesList = () => (
  <List sort={{ field: "id", order: "DESC" }}>
    <Datagrid rowClick="show">
      <TextField source="name" label="Name" />
      <TextField source="amount" label="Amount" />
      <TextField source="description" label="Description" />
    </Datagrid>
  </List>
);
