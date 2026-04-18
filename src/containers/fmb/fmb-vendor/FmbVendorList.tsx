import {
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
  <TextInput key="q" source="q" label="Search name or mobile" alwaysOn sx={{ minWidth: 280 }} />,
];

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export default function FmbVendorList(props: ListProps) {
  return (
    <List
      {...props}
      title="FMB Vendors"
      perPage={50}
      sort={{ field: "name", order: "ASC" }}
      filters={filters}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      actions={<ListActions />}
    >
      <Datagrid bulkActionButtons={false} rowClick="show">
        <TextField source="name" />
        <TextField source="mobile" emptyText="—" />
        <TextField source="remarks" emptyText="—" />
      </Datagrid>
    </List>
  );
}
