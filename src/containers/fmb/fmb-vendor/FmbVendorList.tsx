import {
  CreateButton,
  Datagrid,
  ExportButton,
  List,
  Pagination,
  TextField,
  TopToolbar,
  type ListProps,
} from "react-admin";

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
