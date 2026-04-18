import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, useNotify, useRecordContext, useRefresh } from "react-admin";
import { Box, Chip, Divider, Stack } from "@mui/material";

import { getApiUrl } from "@/constants";
import httpClient from "@/dataprovider/http-client";

import AddThalisDialog from "./AddThalisDialog";
import AssignedThaliTypeBreakdown from "./AssignedThaliTypeBreakdown";
import AssignedThalisTable from "./AssignedThalisTable";
import { assignmentThaliId, type AssignmentRow } from "./assignedThalisUtils";
import { useReportAssignmentsTabTotal } from "../AssignmentsTabCountContext";

function rowsFromResponse(json: unknown): unknown[] {
  if (
    json &&
    typeof json === "object" &&
    "rows" in json &&
    Array.isArray((json as { rows: unknown }).rows)
  ) {
    return (json as { rows: unknown[] }).rows;
  }
  return [];
}

export default function AssignmentsTab() {
  const record = useRecordContext();
  const distributorId = record?.id as string | number | undefined;
  const notify = useNotify();
  const refresh = useRefresh();
  const setTabTotalAssigned = useReportAssignmentsTabTotal();

  const [busy, setBusy] = useState(false);
  const [addThalisDialogOpen, setAddThalisDialogOpen] = useState(false);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);

  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const assignmentsLoadForIdRef = useRef<string | undefined>(undefined);

  const loadAssignments = useCallback(async () => {
    if (!distributorId) return;
    const sid = String(distributorId);
    if (assignmentsLoadForIdRef.current !== sid) {
      assignmentsLoadForIdRef.current = sid;
      setAssignments([]);
    }
    setBusy(true);
    try {
      const res = await httpClient(
        `${getApiUrl()}/fmbThaliDistribution/assignments?distributorId=${encodeURIComponent(
          String(distributorId)
        )}`,
        { method: "GET" }
      );
      setAssignments(rowsFromResponse(res.json) as AssignmentRow[]);
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Failed to load assignments", { type: "warning" });
    } finally {
      setBusy(false);
    }
  }, [distributorId, notify]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    setTabTotalAssigned(assignments.length);
  }, [assignments.length, setTabTotalAssigned]);

  const assignedThaliIdSet = useMemo(() => {
    const next = new Set<string>();
    for (const a of assignments) {
      const id = assignmentThaliId(a);
      if (id) next.add(id);
    }
    return next;
  }, [assignments]);

  const onAssignSuccess = useCallback(async () => {
    await loadAssignments();
    refresh();
  }, [loadAssignments, refresh]);

  const doUnassign = async (fmbThaliId: string) => {
    if (!fmbThaliId) return;
    setBusy(true);
    try {
      await httpClient(`${getApiUrl()}/fmbThaliDistribution/unassign`, {
        method: "POST",
        body: JSON.stringify({ fmbThaliIds: [fmbThaliId] }),
      });
      notify("Unassigned", { type: "info" });
      await loadAssignments();
      refresh();
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Unassign failed", { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const doBulkUnassign = async (fmbThaliIds: string[]) => {
    if (!fmbThaliIds.length) {
      notify("Select at least one assigned thali to remove", { type: "warning" });
      return;
    }
    setBusy(true);
    try {
      await httpClient(`${getApiUrl()}/fmbThaliDistribution/unassign`, {
        method: "POST",
        body: JSON.stringify({ fmbThaliIds }),
      });
      notify(`Unassigned ${fmbThaliIds.length} thali(s)`, { type: "info" });
      await loadAssignments();
      refresh();
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Bulk unassign failed", { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 2 }}
      >
        <Button
          label="Add thalis"
          variant="contained"
          onClick={() => setAddThalisDialogOpen(true)}
          disabled={!distributorId}
        />
        {pendingQueueCount > 0 ? (
          <Chip
            size="small"
            variant="outlined"
            color="primary"
            label={`${pendingQueueCount} thali(s) queued — open Add thalis to review or assign`}
          />
        ) : null}
        <Button
          label="Refresh assignments"
          onClick={() => void loadAssignments()}
          disabled={busy}
        />
      </Stack>

      <AddThalisDialog
        open={addThalisDialogOpen}
        onClose={() => setAddThalisDialogOpen(false)}
        distributorId={distributorId}
        assignedThaliIdSet={assignedThaliIdSet}
        busy={busy}
        onAssignSuccess={onAssignSuccess}
        onReloadAssignments={loadAssignments}
        onPendingQueueChange={setPendingQueueCount}
      />

      <Divider sx={{ my: 2 }} />

      <AssignedThaliTypeBreakdown assignments={assignments} />

      <AssignedThalisTable
        distributorId={distributorId}
        assignments={assignments}
        busy={busy}
        onUnassignOne={doUnassign}
        onBulkUnassign={doBulkUnassign}
      />
    </Box>
  );
}
