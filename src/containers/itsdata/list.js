import React from "react";
import {
  DatagridConfigurable,
  List,
  SearchInput,
  SelectColumnsButton,
  TextField,
  TopToolbar,
  DateField,
} from "react-admin";
import ITSSyncUploadButton from "../../components/uploadHelpers/ITSSyncUpload";
import CustomEmpty from "../../components/CustomEmpty";

const ListActions = () => (
  <TopToolbar>
    <SelectColumnsButton />
    <ITSSyncUploadButton />
  </TopToolbar>
);

const itsFilters = [<SearchInput source="q" alwaysOn key="q" />];
export default () => (
  <List
    actions={<ListActions />}
    filters={itsFilters}
    empty={
      <CustomEmpty
        title="No ITS data found"
        subtitle="Get started by syncing an XLSX file to import ITS data"
        action={<ITSSyncUploadButton variant="contained" />}
      />
    }
  >
    <DatagridConfigurable rowClick="" bulkActionButtons={false}>
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
