import React from "react";
import {
  List,
  Datagrid,
  TextInput,
  TextField,
  DateField,
  TopToolbar,
  CreateButton,
  ExportButton,
  Pagination,
  type ListProps,
} from "react-admin";
import DailySummarySection from "./DailySummarySection";

const filters = [<TextInput source="fmbThaliId" key="fmbThaliId" label="Thali id" />];

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export default function FmbThaliSuspensionList(props: ListProps) {
  return (
    <>
      <DailySummarySection />
      <List
        {...props}
        sort={{ field: "startDate", order: "DESC" }}
        perPage={25}
        pagination={<Pagination rowsPerPageOptions={[10, 25, 50]} />}
        filters={filters}
        actions={<ListActions />}
      >
        <Datagrid rowClick="edit" bulkActionButtons={false}>
          <TextField source="fmbThaliId" label="Thali id" />
          <DateField source="startDate" />
          <DateField source="endDate" />
          <TextField source="remarks" emptyText="—" />
        </Datagrid>
      </List>
    </>
  );
}
