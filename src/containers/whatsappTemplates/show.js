import React from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
  Button,
  useNotify,
  useRefresh,
  useRecordContext,
  useDataProvider,
  FunctionField,
  DeleteButton,
  EditButton,
} from "react-admin";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
} from "@mui/material";

const TemplateActions = () => {
  const notify = useNotify();
  const refresh = useRefresh();
  const record = useRecordContext();
  const dataProvider = useDataProvider();

  const handleRefresh = async () => {
    try {
      // Refresh the current template from Meta API
      await dataProvider.create("whatsappTemplates", {
        data: {},
        meta: { action: "refresh", name: record.name },
      });
      notify("Template refreshed successfully", { type: "success" });
      refresh();
    } catch (error) {
      notify(error?.body?.message || "Failed to refresh template", {
        type: "error",
      });
    }
  };

  return (
    <TopToolbar>
      <EditButton />
      <Button
        label="Refresh from Meta"
        onClick={handleRefresh}
        startIcon={<RefreshIcon />}
      />
      <DeleteButton />
    </TopToolbar>
  );
};

const StatusChip = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "error";
      case "PAUSED":
        return "default";
      default:
        return "default";
    }
  };

  return <Chip label={status} color={getColor()} size="small" />;
};

const QualityScoreChip = ({ score }) => {
  if (!score) return null;

  const getColor = () => {
    switch (score) {
      case "GREEN":
        return "success";
      case "YELLOW":
        return "warning";
      case "RED":
        return "error";
      default:
        return "default";
    }
  };

  return <Chip label={score} color={getColor()} size="small" />;
};

const TemplatePreview = ({ record }) => {
  if (!record) return null;

  return (
    <Card sx={{ mt: 2, mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Template Preview
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Header */}
        {record.headerType && (
          <Box sx={{ mb: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              HEADER ({record.headerType})
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {record.headerContent || "No header content"}
            </Typography>
          </Box>
        )}

        {/* Body */}
        {record.bodyText && (
          <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              BODY
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
              {record.bodyText}
            </Typography>
          </Box>
        )}

        {/* Footer */}
        {record.footerText && (
          <Box sx={{ mb: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              FOOTER
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {record.footerText}
            </Typography>
          </Box>
        )}

        {/* Buttons */}
        {record.buttonData && record.buttonData.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              BUTTONS
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
              {record.buttonData.map((button, index) => (
                <Chip
                  key={index}
                  label={`${button.type}: ${button.text || button.url || ""}`}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default () => (
  <Show actions={<TemplateActions />}>
    <SimpleShowLayout>
      <TextField source="name" label="Template Name" />
      <FunctionField
        label="Status"
        render={(record) => <StatusChip status={record.status} />}
      />
      <FunctionField
        label="Quality Score"
        render={(record) => <QualityScoreChip score={record.qualityScore} />}
      />
      <TextField source="category" label="Category" />
      <TextField source="language" label="Language" />
      <TextField source="metaId" label="Meta Template ID" />
      <FunctionField
        label="Last Synced"
        render={(record) =>
          record.lastSyncedAt
            ? new Date(record.lastSyncedAt).toLocaleString()
            : "Never"
        }
      />
      <Divider sx={{ my: 2 }} />
      <FunctionField
        label="Template Components"
        render={(record) => <TemplatePreview record={record} />}
      />
    </SimpleShowLayout>
  </Show>
);
