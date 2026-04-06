import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, useNotify, useRecordContext, useRefresh } from "react-admin";
import { Box, Chip, Divider, Stack, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

import { getApiUrl } from "@/constants";
import httpClient from "@/dataprovider/http-client";

interface FmbThaliRow {
  id?: string;
  thaliNo?: string;
  deliveryMohallah?: string;
  fmb?: { itsNo?: string; name?: string };
}

interface AssignmentRow {
  id?: string;
  fmbThaliId?: string;
  fmbThali?: FmbThaliRow;
}

function thaliLabel(t: FmbThaliRow): string {
  const thaliNo = t?.thaliNo ?? "—";
  const its = t?.fmb?.itsNo ?? "—";
  const name = t?.fmb?.name ?? "—";
  const moh = t?.deliveryMohallah ?? "—";
  return `${thaliNo} · ITS ${its} · ${name} · ${moh}`;
}

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

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [thaliOptions, setThaliOptions] = useState<FmbThaliRow[]>([]);
  const [selectedThalis, setSelectedThalis] = useState<FmbThaliRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);

  const loadAssignments = useCallback(async () => {
    if (!distributorId) return;
    setLoading(true);
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
      setLoading(false);
    }
  }, [distributorId, notify]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  const fetchThalis = async (q: string) => {
    if (!distributorId) return;
    setLoading(true);
    try {
      const res = await httpClient(
        `${getApiUrl()}/fmbThaliDistribution/thalis?search=${encodeURIComponent(q || "")}&limit=50`,
        { method: "GET" }
      );
      setThaliOptions(rowsFromResponse(res.json) as FmbThaliRow[]);
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Failed to search thalis", { type: "warning" });
    } finally {
      setLoading(false);
    }
  };

  const assignedThaliIdSet = useMemo(() => {
    const next = new Set<string>();
    assignments.forEach((a) => {
      if (a?.fmbThaliId) next.add(String(a.fmbThaliId));
      if (a?.fmbThali?.id) next.add(String(a.fmbThali.id));
    });
    return next;
  }, [assignments]);

  const doAssign = async () => {
    const ids = selectedThalis.map((t) => t?.id).filter(Boolean) as string[];
    if (!ids.length) {
      notify("Select at least one thali to assign", { type: "warning" });
      return;
    }
    if (!distributorId) return;
    setLoading(true);
    try {
      await httpClient(`${getApiUrl()}/fmbThaliDistribution/assign`, {
        method: "POST",
        body: JSON.stringify({ distributorId, fmbThaliIds: ids }),
      });
      notify("Assigned successfully", { type: "info" });
      setSelectedThalis([]);
      await loadAssignments();
      refresh();
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Assign failed", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const doUnassign = async (fmbThaliId: string) => {
    if (!fmbThaliId) return;
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Search thalis and bulk-assign them to this distributor. Each thali can only be assigned to
        one distributor at a time.
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 320 }}>
          <Autocomplete<FmbThaliRow, true, false, false>
            multiple
            options={thaliOptions}
            value={selectedThalis}
            loading={loading}
            getOptionLabel={thaliLabel}
            filterSelectedOptions
            isOptionEqualToValue={(o, v) => o?.id === v?.id}
            onInputChange={(_, v) => {
              setSearch(v || "");
              void fetchThalis(v || "");
            }}
            onChange={(_, v) => {
              const filtered = (v || []).filter(
                (t) => t?.id && !assignedThaliIdSet.has(String(t.id))
              );
              setSelectedThalis(filtered);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search thalis (thali no / ITS / name / mohallah)"
                placeholder="Type to search…"
              />
            )}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button label="Assign selected" onClick={() => void doAssign()} disabled={loading} />
            <Button label="Refresh" onClick={() => void loadAssignments()} disabled={loading} />
          </Stack>
          {!!search && (
            <Typography variant="caption" color="text.secondary">
              Search: {search}
            </Typography>
          )}
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Currently assigned
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {(assignments || []).map((a) => {
          const thali = a?.fmbThali;
          const thaliId = a?.fmbThaliId || thali?.id;
          const label = thali ? thaliLabel(thali) : String(thaliId ?? "—");
          return (
            <Chip
              key={a?.id || String(thaliId)}
              label={label}
              onDelete={thaliId ? () => void doUnassign(String(thaliId)) : undefined}
              disabled={loading}
              variant="outlined"
              sx={{ mb: 1 }}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
