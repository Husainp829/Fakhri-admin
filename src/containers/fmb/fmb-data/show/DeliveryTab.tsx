import { useCallback, useState } from "react";
import { Alert, Box, Button, Paper, Typography } from "@mui/material";
import {
  Datagrid,
  DateField,
  FunctionField,
  Pagination,
  ReferenceManyField,
  TextField,
  useNotify,
  usePermissions,
  useRecordContext,
  useRefresh,
  type RaRecord,
} from "react-admin";
import type { Identifier } from "ra-core";
import httpClient from "@/dataprovider/http-client";
import { getApiUrl } from "@/constants";
import type { PermissionRecord } from "@/types/permissions";
import { hasPermission } from "@/utils/permission-utils";

type ThaliRow = {
  id?: string;
  thaliNo?: string;
  isActive?: boolean;
  deliveryPaused?: boolean;
  deliveryPausedSince?: string | null;
  deliveryResumeEffective?: string | null;
  thaliType?: { name?: string };
};

function ThaliDeliveryActions({ thali }: { thali: ThaliRow }) {
  const notify = useNotify();
  const refresh = useRefresh();
  const { permissions } = usePermissions<PermissionRecord>();
  const [busy, setBusy] = useState(false);

  const canPause = hasPermission(permissions, "fmbThaliDelivery.pause");
  const canResume = hasPermission(permissions, "fmbThaliDelivery.resume");

  const postToggle = useCallback(
    async (path: "pause" | "resume") => {
      if (!thali.id) {
        return;
      }
      setBusy(true);
      try {
        const headers = new Headers({ "Content-Type": "application/json" });
        await httpClient(`${getApiUrl()}/fmbThaliDelivery/${path}`, {
          method: "POST",
          body: JSON.stringify({ fmbThaliId: thali.id }),
          headers,
        });
        notify(path === "pause" ? "Delivery pause requested" : "Delivery resume requested", {
          type: "success",
        });
        refresh();
      } catch (e: unknown) {
        const msg =
          e && typeof e === "object" && "message" in e
            ? String((e as Error).message)
            : "Request failed";
        notify(msg, { type: "error" });
      } finally {
        setBusy(false);
      }
    },
    [notify, refresh, thali.id]
  );

  if (!thali.isActive) {
    return (
      <Typography variant="caption" color="text.secondary">
        Inactive thali
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
      <Button
        size="small"
        variant="outlined"
        color="warning"
        disabled={busy || !canPause || Boolean(thali.deliveryPaused)}
        onClick={() => void postToggle("pause")}
      >
        Pause delivery
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="primary"
        disabled={busy || !canResume || !thali.deliveryPaused}
        onClick={() => void postToggle("resume")}
      >
        Resume delivery
      </Button>
    </Box>
  );
}

function ThaliDeliveryStatus({ thali }: { thali: ThaliRow }) {
  if (!thali.deliveryPaused) {
    if (thali.deliveryResumeEffective) {
      return (
        <Alert severity="info" sx={{ mb: 1 }}>
          Delivery resumes from service day {thali.deliveryResumeEffective} (excluded from earlier
          dates until then).
        </Alert>
      );
    }
    return (
      <Alert severity="success" sx={{ mb: 1 }}>
        Delivery active (not paused for upcoming service days under current rules).
      </Alert>
    );
  }

  return (
    <Alert severity="warning" sx={{ mb: 1 }}>
      Paused from service day {thali.deliveryPausedSince ?? "—"} onward.
    </Alert>
  );
}

export default function DeliveryTab() {
  const record = useRecordContext();
  const thalis = Array.isArray(record?.thalis) ? (record!.thalis as ThaliRow[]) : [];

  if (!thalis.length) {
    return (
      <Box sx={{ p: 1 }}>
        <Typography color="text.secondary">No thalis found for this FMB.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      {thalis.map((thali) => (
        <Paper key={thali.id} sx={{ p: 1.5, mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
              gap: 2,
            }}
          >
            <Typography variant="subtitle2">
              {thali.thaliNo}
              {thali?.thaliType?.name ? ` — ${thali.thaliType.name}` : ""}
            </Typography>
            <ThaliDeliveryActions thali={thali} />
          </Box>
          <ThaliDeliveryStatus thali={thali} />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
            History
          </Typography>
          <ReferenceManyField
            reference="fmbThaliDeliveryToggleLog"
            target="fmbThaliId"
            label={false}
            record={thali as RaRecord<Identifier>}
            sort={{ field: "createdAt", order: "DESC" }}
            perPage={5}
            pagination={<Pagination rowsPerPageOptions={[5]} />}
          >
            <Datagrid
              bulkActionButtons={false}
              size="small"
              rowClick={false}
              empty={
                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                  No delivery pause/resume history yet.
                </Typography>
              }
            >
              <FunctionField
                label="Action"
                render={(row: { action?: string }) => (row.action === "PAUSE" ? "Pause" : "Resume")}
              />
              <TextField source="effectiveServiceDay" label="Effective day" />
              <TextField source="source" label="Source" />
              <DateField source="createdAt" label="Logged at" showTime />
            </Datagrid>
          </ReferenceManyField>
        </Paper>
      ))}
    </Box>
  );
}
