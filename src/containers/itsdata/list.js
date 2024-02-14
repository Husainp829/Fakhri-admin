import React from "react";
import {
  DatagridConfigurable,
  ExportButton,
  List,
  SearchInput,
  SelectColumnsButton,
  TextField,
  TopToolbar,
  DateField,
} from "react-admin";

const ListActions = () => (
  <TopToolbar>
    <SelectColumnsButton />
    <ExportButton />
  </TopToolbar>
);

const itsFilters = [<SearchInput source="q" alwaysOn key="q" />];
export default () => (
  <List actions={<ListActions />} filters={itsFilters}>
    <DatagridConfigurable rowClick="">
      <TextField source="id" label="ITS" />
      <TextField source="HOF_FM_TYPE" label="Type" />
      <TextField source="HOF_ID" label="HOF ITS" />
      <TextField source="Full_Name" />
      <TextField source="Age" />
      <TextField source="Gender" />
      <TextField source="Mobile" />
      <TextField source="Email" />
      <TextField source="Address" />
      <DateField source="updatedAt" />
    </DatagridConfigurable>
  </List>
);
