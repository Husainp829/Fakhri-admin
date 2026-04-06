import type { ComponentProps } from "react";
import { useState } from "react";
import type { RaRecord } from "react-admin";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  usePermissions,
  useNotify,
  TopToolbar,
  Button,
  useRefresh,
} from "react-admin";
import {
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import MuiButton from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { hasPermission } from "@/utils/permission-utils";
import CustomEmpty from "@/components/custom-empty";
import { callApi } from "@/dataprovider/misc-apis";

type CronStatusRecord = RaRecord & {
  status?: string;
  completedAt?: string;
  startedAt?: string;
};

type TriggerCronButtonProps = Partial<ComponentProps<typeof Button>>;

const TriggerCronButton = (props: TriggerCronButtonProps) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cronName, setCronName] = useState("");
  const [availableCrons, setAvailableCrons] = useState<string[]>([]);

  const handleOpen = async () => {
    setOpen(true);
    try {
      const response = await callApi({
        location: "cronStatus/list/available",
        method: "GET",
      });
      const payload = response.data as { cronJobs?: string[] };
      setAvailableCrons(payload?.cronJobs || []);
    } catch {
      notify("Failed to load available cron jobs", { type: "error" });
    }
  };

  const handleTrigger = async () => {
    if (!cronName) {
      notify("Please select a cron job", { type: "warning" });
      return;
    }

    setLoading(true);
    try {
      const response = await callApi({
        location: "cronStatus/trigger",
        method: "POST",
        id: cronName,
      });

      const triggerPayload = response.data as { success?: boolean; message?: string };
      if (triggerPayload?.success) {
        notify(`Cron job "${cronName}" triggered successfully`, {
          type: "success",
        });
        setOpen(false);
        setCronName("");
        setTimeout(() => {
          refresh();
        }, 1000);
      } else {
        notify(triggerPayload?.message || "Failed to trigger cron job", {
          type: "error",
        });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to trigger cron job";
      notify(errorMessage, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        label="Trigger Cron"
        onClick={handleOpen}
        startIcon={<PlayArrowIcon />}
        variant="contained"
        {...props}
      />
      <Dialog open={open} onClose={() => !loading && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Trigger Cron Job</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Select a cron job to trigger:
            </Typography>
            {availableCrons.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Loading available cron jobs...
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {availableCrons.map((name) => (
                  <MuiButton
                    key={name}
                    variant={cronName === name ? "contained" : "outlined"}
                    onClick={() => setCronName(name)}
                    fullWidth
                    sx={{ justifyContent: "flex-start", textTransform: "none" }}
                  >
                    {name}
                  </MuiButton>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleTrigger}
            variant="contained"
            disabled={loading || !cronName}
            startIcon={loading ? <CircularProgress size={16} /> : <PlayArrowIcon />}
          >
            {loading ? "Triggering..." : "Trigger"}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

const ListActions = () => (
  <TopToolbar>
    <TriggerCronButton />
  </TopToolbar>
);

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

const CronStatusList = () => {
  const { permissions } = usePermissions();

  if (!hasPermission(permissions, "cronStatus.view")) {
    return null;
  }

  return (
    <List
      actions={<ListActions />}
      empty={
        <CustomEmpty
          title="No cron status found"
          subtitle="Get started by triggering a cron job"
          action={<TriggerCronButton variant="contained" />}
        />
      }
    >
      <Datagrid rowClick="show">
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
        <DateField source="startedAt" label="Started At" showTime />
        <DateField source="completedAt" label="Completed At" showTime />
        <FunctionField
          label="Duration"
          render={(record: CronStatusRecord) => durationLabel(record)}
        />
        <TextField source="errorMessage" label="Error Message" />
      </Datagrid>
    </List>
  );
};

export default CronStatusList;
