import React from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  FunctionField,
  usePermissions,
} from "react-admin";
import { Chip, Box, Typography, Paper } from "@mui/material";
import { hasPermission } from "../../utils/permissionUtils";

const CronStatusShow = () => {
  const { permissions } = usePermissions();

  if (!hasPermission(permissions, "cronStatus.view")) {
    return null;
  }

  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="cronName" label="Cron Name" />
        <FunctionField
          label="Status"
          render={(record) => (
            <Chip
              label={record.status}
              color={record.status === "SUCCESS" ? "success" : "error"}
              size="small"
            />
          )}
        />
        <DateField source="startedAt" label="Started At" showTime />
        <DateField source="completedAt" label="Completed At" showTime />
        <FunctionField
          label="Duration"
          render={(record) => {
            if (!record.completedAt || !record.startedAt) return "-";
            const duration =
              new Date(record.completedAt) - new Date(record.startedAt);
            const seconds = Math.floor(duration / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            if (hours > 0) {
              return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
            }
            if (minutes > 0) {
              return `${minutes}m ${seconds % 60}s`;
            }
            return `${seconds}s`;
          }}
        />
        <TextField source="errorMessage" label="Error Message" multiline />
        <FunctionField
          label="Metadata"
          render={(record) => (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Metadata:
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "grey.100",
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {record.metadata
                  ? JSON.stringify(record.metadata, null, 2)
                  : "No metadata"}
              </Paper>
            </Box>
          )}
        />
        <DateField source="createdAt" label="Created At" showTime />
        <DateField source="updatedAt" label="Updated At" showTime />
      </SimpleShowLayout>
    </Show>
  );
};

export default CronStatusShow;
