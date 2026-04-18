import React from "react";
import {
  BooleanField,
  CreateButton,
  Datagrid,
  ExportButton,
  List,
  NumberField,
  Pagination,
  TextField,
  TextInput,
  TopToolbar,
  type ListProps,
} from "react-admin";

const filters = [
  <TextInput key="q" source="q" label="Search code or name" alwaysOn sx={{ minWidth: 260 }} />,
];

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export default function FmbThaliTypeList(props: ListProps) {
  return (
    <List
      {...props}
      title="Thali Types"
      perPage={50}
      sort={{ field: "sortOrder", order: "ASC" }}
      filters={filters}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      actions={<ListActions />}
    >
      <Datagrid bulkActionButtons={false} rowClick="edit">
        <TextField source="code" />
        <TextField source="name" />
        <NumberField source="sortOrder" />
        <BooleanField source="isActive" />
      </Datagrid>
    </List>
  );
}
