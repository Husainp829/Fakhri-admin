import React from "react";
import { Box, Button } from "@mui/material";
import { Datagrid, DateField, ReferenceManyField, TextField, useRecordContext } from "react-admin";
import { Link } from "react-router-dom";

const AddSuspensionButton = () => {
  const record = useRecordContext();
  if (!record?.id) {
    return null;
  }
  return (
    <Button
      component={Link}
      to={`/fmbThaliSuspension/create?fmbId=${encodeURIComponent(record.id)}`}
      variant="contained"
      color="primary"
      size="small"
    >
      Add suspension
    </Button>
  );
};

export default function SuspensionsTab() {
  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ mb: 2 }}>
        <AddSuspensionButton />
      </Box>
      <ReferenceManyField
        reference="fmbThaliSuspension"
        target="fmbId"
        label={false}
        sort={{ field: "startDate", order: "DESC" }}
        perPage={50}
      >
        <Datagrid rowClick="edit" bulkActionButtons={false}>
          <DateField source="startDate" label="Start (inclusive)" />
          <DateField source="endDate" label="End (inclusive)" />
          <TextField source="remarks" emptyText="—" />
        </Datagrid>
      </ReferenceManyField>
    </Box>
  );
}
