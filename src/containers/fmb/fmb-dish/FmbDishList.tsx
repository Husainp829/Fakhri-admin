import React from "react";
import {
  CreateButton,
  Datagrid,
  List,
  Pagination,
  TextField,
  TopToolbar,
  type ListProps,
} from "react-admin";

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
  </TopToolbar>
);

export default function FmbDishList(props: ListProps) {
  return (
    <List
      {...props}
      title="Dishes"
      perPage={50}
      sort={{ field: "sortOrder", order: "ASC" }}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      actions={<ListActions />}
    >
      <Datagrid bulkActionButtons={false} rowClick="edit">
        <TextField source="name" />
        <TextField source="dietaryType" label="Dietary" />
        <TextField source="sortOrder" label="Order" />
      </Datagrid>
    </List>
  );
}
