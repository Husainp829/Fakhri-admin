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
  type RaRecord,
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

const statusColors: Record<string, "default" | "warning" | "success" | "error"> = {
  PENDING: "default",
  PROCESSING: "warning",
  COMPLETED: "success",
  FAILED: "error",
  CANCELLED: "default",
};

const StatusField = ({ record }: { record?: RaRecord }) => {
  if (!record) return null;
  const status = String(record.status ?? "");
  return <Chip label={status} color={statusColors[status] || "default"} size="small" />;
};

export default function WhatsappBroadcastList() {
  return (
    <List actions={<ListActions />} filters={broadcastFilters}>
      <DatagridConfigurable rowClick="show" bulkActionButtons={false}>
        <TextField source="name" label="Broadcast Name" />
        <TextField source="templateName" label="Template" />
        <FunctionField label="Status" render={(record) => <StatusField record={record} />} />
        <NumberField source="totalRecipients" label="Total" />
        <NumberField source="successCount" label="Success" />
        <NumberField source="failureCount" label="Failed" />
        <DateField source="createdAt" label="Created" showTime />
        <DateField source="startedAt" label="Started" showTime />
        <DateField source="completedAt" label="Completed" showTime />
      </DatagridConfigurable>
    </List>
  );
}
