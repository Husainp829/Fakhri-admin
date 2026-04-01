import React from "react";
import { Datagrid, List, TextField, EditButton } from "react-admin";
import Box from "@mui/material/Box";

const MakhsoosItsDataList = () => (
  <List sort={{ field: "itsNo", order: "ASC" }} perPage={50}>
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <Datagrid rowClick="edit" bulkActionButtons={false} sx={{ minWidth: 1100 }}>
        <TextField source="itsNo" label="ITS" />
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
