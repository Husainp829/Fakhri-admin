import React from "react";
import {
  DatagridConfigurable,
  ExportButton,
  List,
  SelectColumnsButton,
  TextField,
  TopToolbar,
  SelectInput,
  FunctionField,
  DateField,
  NumberField,
  CreateButton,
} from "react-admin";
import { Chip } from "@mui/material";

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <SelectColumnsButton />
    <ExportButton />
  </TopToolbar>
);

const broadcastFilters = [
  <SelectInput
    source="status"
    choices={[
      { id: "PENDING", name: "Pending" },
      { id: "PROCESSING", name: "Processing" },
      { id: "COMPLETED", name: "Completed" },
      { id: "FAILED", name: "Failed" },
      { id: "CANCELLED", name: "Cancelled" },
    ]}
    alwaysOn={false}
    key="status"
  />,
];

const StatusField = ({ record }) => {
  if (!record) return null;

  const statusColors = {
    PENDING: "default",
    PROCESSING: "warning",
    COMPLETED: "success",
    FAILED: "error",
    CANCELLED: "default",
  };

  return (
    <Chip
      label={record.status}
      color={statusColors[record.status] || "default"}
      size="small"
    />
  );
};

export default () => (
  <List actions={<ListActions />} filters={broadcastFilters}>
    <DatagridConfigurable rowClick="show" bulkActionButtons={false}>
      <TextField source="name" label="Broadcast Name" />
      <TextField source="templateName" label="Template" />
      <FunctionField
        label="Status"
        render={(record) => <StatusField record={record} />}
      />
      <NumberField source="totalRecipients" label="Total" />
      <NumberField source="successCount" label="Success" />
      <NumberField source="failureCount" label="Failed" />
      <DateField source="createdAt" label="Created" showTime />
      <DateField source="startedAt" label="Started" showTime />
      <DateField source="completedAt" label="Completed" showTime />
    </DatagridConfigurable>
  </List>
);
