import React from "react";
import {
  BooleanField,
  CreateButton,
  Datagrid,
  ExportButton,
  List,
  Pagination,
  TextField,
  TextInput,
  TopToolbar,
  type ListProps,
} from "react-admin";

const filters = [
  <TextInput
    key="q"
    source="q"
    label="Search code, name, phone, or remarks"
    alwaysOn
    sx={{ minWidth: 280 }}
  />,
];

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export default function FmbThaliDistributorList(props: ListProps) {
  return (
    <List
      {...props}
      title="Thali Distributors"
      perPage={50}
      sort={{ field: "code", order: "ASC" }}
      filters={filters}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      actions={<ListActions />}
    >
      <Datagrid bulkActionButtons={false} rowClick="edit">
        <TextField source="code" />
        <TextField source="name" />
        <TextField source="phone" />
        <BooleanField source="isActive" />
        <TextField source="remarks" />
      </Datagrid>
    </List>
  );
}
