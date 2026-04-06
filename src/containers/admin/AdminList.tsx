import type { ListProps } from "react-admin";
import { List, Datagrid, TextField, EmailField } from "react-admin";

const AdminList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="name" />
      <EmailField source="email" />
    </Datagrid>
  </List>
);

export default AdminList;
