import React from "react";
import {
  Datagrid,
  List,
  TextField,
  TextInput,
  EditButton,
  TopToolbar,
  FilterButton,
  ExportButton,
} from "react-admin";
import Box from "@mui/material/Box";

const MakhsoosFilters = [
  <TextInput
    source="itsNoContains"
    label="Search (ITS or full name)"
    alwaysOn
    key="itsNoContains"
  />,
  <TextInput source="sectorContains" label="Sector contains" key="sectorContains" />,
  <TextInput source="subSectorContains" label="Sub-sector contains" key="subSectorContains" />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <ExportButton />
  </TopToolbar>
);

const MakhsoosItsDataList = () => (
  <List
    sort={{ field: "itsNo", order: "ASC" }}
    perPage={50}
    filters={MakhsoosFilters}
    actions={<ListActions />}
  >
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <Datagrid rowClick="edit" bulkActionButtons={false} sx={{ minWidth: 1100 }}>
        <TextField source="itsNo" label="ITS" />
        <TextField source="fullName" label="Full name" emptyText="—" />
        <TextField source="sector" label="Sector" emptyText="—" />
        <TextField source="subSector" label="Sub-sector" emptyText="—" />
        <TextField source="sectorMasool" label="Sector masool" emptyText="—" />
        <TextField source="sectorMusaid" label="Sector musaid" emptyText="—" />
        <TextField source="subSectorMasool" label="Sub-sector masool" emptyText="—" />
        <TextField source="subSectorMusaid" label="Sub-sector musaid" emptyText="—" />
        <EditButton />
      </Datagrid>
    </Box>
  </List>
);

export default MakhsoosItsDataList;
