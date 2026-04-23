import type { RaRecord } from "react-admin";
import { Show, SimpleShowLayout, TextField, FunctionField, usePermissions } from "react-admin";
import { formatDisplayDateTime } from "@/utils/date-format";
import { Chip, Box, Typography, Paper } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { hasPermission } from "@/utils/permission-utils";

type CronStatusRecord = RaRecord & {
  status?: string;
  completedAt?: string;
  startedAt?: string;
  metadata?: unknown;
};

const durationLabel = (record: CronStatusRecord) => {
  if (!record.completedAt || !record.startedAt) return "-";
  const duration = new Date(record.completedAt).getTime() - new Date(record.startedAt).getTime();
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
};

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
          render={(record: CronStatusRecord) => (
            <Chip
              label={record.status}
              color={record.status === "SUCCESS" ? "success" : "error"}
              size="small"
            />
          )}
        />
        <FunctionField
          label="Started At"
          render={(record: CronStatusRecord) =>
            formatDisplayDateTime(record?.startedAt, { empty: "—" })
          }
        />
        <FunctionField
          label="Completed At"
          render={(record: CronStatusRecord) =>
            formatDisplayDateTime(record?.completedAt, { empty: "—" })
          }
        />
        <FunctionField
          label="Duration"
          render={(record: CronStatusRecord) => durationLabel(record)}
        />
        <TextField source="errorMessage" label="Error Message" />
        <FunctionField
          label="Metadata"
          render={(record: CronStatusRecord) => (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Metadata:
              </Typography>
              <Paper
                variant="outlined"
                sx={(theme) => ({
                  p: 2,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.06)
                      : theme.palette.grey[100],
                  borderColor: "divider",
                  color: "text.primary",
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                })}
              >
                {record.metadata ? JSON.stringify(record.metadata, null, 2) : "No metadata"}
              </Paper>
            </Box>
          )}
        />
        <FunctionField
          label="Created At"
          render={(record: CronStatusRecord) =>
            formatDisplayDateTime(record?.createdAt, { empty: "—" })
          }
        />
        <FunctionField
          label="Updated At"
          render={(record: CronStatusRecord) =>
            formatDisplayDateTime(record?.updatedAt, { empty: "—" })
          }
        />
      </SimpleShowLayout>
    </Show>
  );
};

export default CronStatusShow;
