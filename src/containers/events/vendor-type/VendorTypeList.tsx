import { List, Datagrid, TextField, type ListProps } from "react-admin";

export const VendorTypeList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" label="Type" />
    </Datagrid>
  </List>
);
