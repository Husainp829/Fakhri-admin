import { List, Datagrid, TextField, ReferenceField, type ListProps } from "react-admin";

export const VendorList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="name" />
      <TextField source="mobile" />
      <ReferenceField source="updatedBy" reference="admins">
        <TextField source="name" />
      </ReferenceField>
    </Datagrid>
  </List>
);
