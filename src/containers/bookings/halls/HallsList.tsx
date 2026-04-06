import { Datagrid, TextField, List } from "react-admin";

export const HallsList = () => (
  <List sort={{ field: "name", order: "DESC" }}>
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="name" label="Name" />
      <TextField source="shortCode" label="ShortCode" />
    </Datagrid>
  </List>
);

export default HallsList;
