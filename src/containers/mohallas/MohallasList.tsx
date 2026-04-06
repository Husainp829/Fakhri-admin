import { Datagrid, TextField, List } from "react-admin";

export const MohallasList = () => (
  <List sort={{ field: "id", order: "DESC" }}>
    <Datagrid rowClick="show">
      <TextField source="id" label="Mohalla" />
    </Datagrid>
  </List>
);
