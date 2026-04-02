import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, useNotify, useRecordContext, useRefresh } from "react-admin";
import { Box, Chip, Divider, Stack, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

import { getApiUrl } from "../../../../constants";
import httpClient from "../../../../dataprovider/httpClient";

function thaliLabel(t) {
  const thaliNo = t?.thaliNo ?? "—";
  const its = t?.fmb?.itsNo ?? "—";
  const name = t?.fmb?.name ?? "—";
  const moh = t?.deliveryMohallah ?? "—";
  return `${thaliNo} · ITS ${its} · ${name} · ${moh}`;
}

export default function AssignmentsTab() {
  const record = useRecordContext();
  const distributorId = record?.id;
  const notify = useNotify();
  const refresh = useRefresh();

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [thaliOptions, setThaliOptions] = useState([]);
  const [selectedThalis, setSelectedThalis] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const loadAssignments = useCallback(async () => {
    if (!distributorId) return;
    setLoading(true);
    try {
      const res = await httpClient(
        `${getApiUrl()}/fmbThaliDistribution/assignments?distributorId=${encodeURIComponent(
          distributorId,
        )}`,
        { method: "GET" },
      );
      setAssignments(Array.isArray(res?.json?.rows) ? res.json.rows : []);
    } catch (e) {
      notify(e?.message || "Failed to load assignments", { type: "warning" });
    } finally {
      setLoading(false);
    }
  }, [distributorId, notify]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const fetchThalis = async (q) => {
    if (!distributorId) return;
    setLoading(true);
    try {
      const res = await httpClient(
        `${getApiUrl()}/fmbThaliDistribution/thalis?search=${encodeURIComponent(q || "")}&limit=50`,
        { method: "GET" },
      );
      setThaliOptions(Array.isArray(res?.json?.rows) ? res.json.rows : []);
    } catch (e) {
      notify(e?.message || "Failed to search thalis", { type: "warning" });
    } finally {
      setLoading(false);
    }
  };

  const assignedThaliIdSet = useMemo(() => {
    const set = new Set();
    assignments.forEach((a) => {
      if (a?.fmbThaliId) set.add(a.fmbThaliId);
      if (a?.fmbThali?.id) set.add(a.fmbThali.id);
    });
    return set;
  }, [assignments]);

  const doAssign = async () => {
    const ids = selectedThalis.map((t) => t?.id).filter(Boolean);
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
    } catch (e) {
      notify(e?.message || "Assign failed", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const doUnassign = async (fmbThaliId) => {
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
    } catch (e) {
      notify(e?.message || "Unassign failed", { type: "error" });
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
          <Autocomplete
            multiple
            options={thaliOptions}
            value={selectedThalis}
            loading={loading}
            getOptionLabel={thaliLabel}
            filterSelectedOptions
            isOptionEqualToValue={(o, v) => o?.id === v?.id}
            onInputChange={(_, v) => {
              setSearch(v || "");
              fetchThalis(v || "");
            }}
            onChange={(_, v) => {
              const filtered = (v || []).filter((t) => !assignedThaliIdSet.has(t?.id));
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
            <Button label="Assign selected" onClick={doAssign} disabled={loading} />
            <Button label="Refresh" onClick={loadAssignments} disabled={loading} />
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
          const label = thali ? thaliLabel(thali) : thaliId || "—";
          return (
            <Chip
              key={a?.id || thaliId}
              label={label}
              onDelete={thaliId ? () => doUnassign(thaliId) : undefined}
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
