import React from "react";
import {
  DatagridConfigurable,
  ExportButton,
  List,
  SelectColumnsButton,
  TextField,
  TopToolbar,
  SelectInput,
  useNotify,
  Button,
  useRefresh,
  useDataProvider,
  CreateButton,
} from "react-admin";
import { Refresh as RefreshIcon } from "@mui/icons-material";

const ListActions = () => {
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  const handleSync = async () => {
    try {
      await dataProvider.create("whatsappTemplates", {
        data: {},
        meta: { action: "sync" },
      });
      notify("Templates synced successfully", { type: "success" });
      refresh();
    } catch (error) {
      notify(error?.body?.message || "Failed to sync templates", {
        type: "error",
      });
    }
  };

  return (
    <TopToolbar>
      <CreateButton />
      <Button
        label="Sync from Meta"
        onClick={handleSync}
        startIcon={<RefreshIcon />}
      />
      <SelectColumnsButton />
      <ExportButton />
    </TopToolbar>
  );
};

const templateFilters = [
  <SelectInput
    source="status"
    choices={[
      { id: "APPROVED", name: "Approved" },
      { id: "PENDING", name: "Pending" },
      { id: "REJECTED", name: "Rejected" },
      { id: "PAUSED", name: "Paused" },
    ]}
    alwaysOn={false}
    key="status"
  />,
  <SelectInput
    source="category"
    choices={[
      { id: "UTILITY", name: "Utility" },
      { id: "MARKETING", name: "Marketing" },
      { id: "AUTHENTICATION", name: "Authentication" },
    ]}
    alwaysOn={false}
    key="category"
  />,
];

export default () => (
  <List actions={<ListActions />} filters={templateFilters}>
    <DatagridConfigurable rowClick="show" bulkActionButtons={false}>
      <TextField source="name" label="Template Name" />
      <TextField source="category" label="Category" />
      <TextField source="language" label="Language" />
      <TextField source="status" label="Status" />
      <TextField source="qualityScore" label="Quality Score" />
      <TextField source="bodyText" label="Body Text" ellipsis />
    </DatagridConfigurable>
  </List>
);
