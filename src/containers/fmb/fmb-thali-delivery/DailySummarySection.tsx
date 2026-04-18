import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import httpClient from "@/dataprovider/http-client";
import { getApiUrl } from "@/constants";

type DailySummaryRow = {
  fmbThaliId?: string;
  name?: string;
  thaliNo?: string;
  thaliType?: string;
  fileNo?: string;
  deliveryAddress?: string;
  deliveryMohallah?: string;
  profileCode?: string;
  profileName?: string;
};

type DailySummaryPayload = {
  rows?: DailySummaryRow[];
  isTenantHoliday?: boolean;
  holidayName?: string;
  timezone?: string;
  count?: number;
};

type SortColumn = "thali" | "fileNo" | "name" | "address" | "schedule";

function rowThaliLabel(row: DailySummaryRow): string {
  const base = (row.thaliNo ?? "").trim();
  const tt = (row.thaliType ?? "").trim();
  return tt ? `${base} (${tt})` : base;
}

function rowAddress(row: DailySummaryRow): string {
  return row.deliveryAddress || row.deliveryMohallah
    ? [row.deliveryAddress, row.deliveryMohallah].filter(Boolean).join(" — ")
    : "";
}

function rowSchedule(row: DailySummaryRow): string {
  return row.profileCode && row.profileName ? `${row.profileCode} — ${row.profileName}` : "";
}

function sortKey(row: DailySummaryRow, col: SortColumn): string {
  switch (col) {
    case "thali":
      return rowThaliLabel(row).toLowerCase();
    case "fileNo":
      return (row.fileNo ?? "").toLowerCase();
    case "name":
      return (row.name ?? "").toLowerCase();
    case "address":
      return rowAddress(row).toLowerCase();
    case "schedule":
      return rowSchedule(row).toLowerCase();
    default:
      return "";
  }
}

export default function DailySummarySection() {
  const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<DailySummaryPayload | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortColumn>("thali");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const q = `${getApiUrl()}/fmbThaliDelivery/daily-summary?date=${encodeURIComponent(date)}`;
    httpClient(q)
      .then(({ json }) => setPayload(json as DailySummaryPayload))
      .catch((e: { message?: string }) => setError(e?.message || "Request failed"))
      .finally(() => setLoading(false));
  }, [date]);

  const rawRows = payload?.rows ?? [];
  const meta = useMemo(() => {
    if (!payload) {
      return null;
    }
    return {
      isTenantHoliday: payload.isTenantHoliday,
      holidayName: payload.holidayName,
      timezone: payload.timezone,
      count: payload.count,
    };
  }, [payload]);

  const filteredRows = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return rawRows;
    return rawRows.filter((row) => {
      const hay = [rowThaliLabel(row), row.fileNo, row.name, rowAddress(row), rowSchedule(row)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(t);
    });
  }, [rawRows, search]);

  const displayRows = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filteredRows].sort((a, b) => {
      const va = sortKey(a, sortBy);
      const vb = sortKey(b, sortBy);
      const cmp = va.localeCompare(vb, undefined, { numeric: true, sensitivity: "base" });
      if (cmp !== 0) return cmp * dir;
      return String(a.fmbThaliId ?? "").localeCompare(String(b.fmbThaliId ?? ""));
    });
  }, [filteredRows, sortBy, sortDir]);

  const requestSort = (col: SortColumn) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Daily delivery summary
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", mb: 2 }}>
        <TextField
          label="Date"
          type="date"
          size="small"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" size="small" onClick={load} disabled={loading}>
          {loading ? "Loading…" : "Load"}
        </Button>
        {meta?.timezone ? (
          <Typography variant="body2" color="text.secondary">
            Tenant TZ: {meta.timezone}
          </Typography>
        ) : null}
      </Box>
      {error ? (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      ) : null}
      {meta?.isTenantHoliday ? (
        <Alert severity="info">
          Tenant holiday{meta.holidayName ? ` — ${meta.holidayName}` : ""}: no deliveries.
        </Alert>
      ) : null}
      {!meta?.isTenantHoliday && payload && meta ? (
        <>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="body2">
              Deliveries expected: {meta.count ?? 0}
              {search.trim() ? (
                <Box component="span" sx={{ ml: 1, color: "text.secondary" }}>
                  (showing {displayRows.length} of {rawRows.length} loaded)
                </Box>
              ) : null}
            </Typography>
            <TextField
              label="Filter table"
              placeholder="Thali, file, name, address, schedule…"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 240, maxWidth: 400 }}
            />
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "thali"}
                    direction={sortBy === "thali" ? sortDir : "asc"}
                    onClick={() => requestSort("thali")}
                  >
                    Thali
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "fileNo"}
                    direction={sortBy === "fileNo" ? sortDir : "asc"}
                    onClick={() => requestSort("fileNo")}
                  >
                    FMB
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "name"}
                    direction={sortBy === "name" ? sortDir : "asc"}
                    onClick={() => requestSort("name")}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "address"}
                    direction={sortBy === "address" ? sortDir : "asc"}
                    onClick={() => requestSort("address")}
                  >
                    Address
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "schedule"}
                    direction={sortBy === "schedule" ? sortDir : "asc"}
                    onClick={() => requestSort("schedule")}
                  >
                    Schedule
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayRows.map((row: DailySummaryRow) => (
                <TableRow key={row.fmbThaliId}>
                  <TableCell>{rowThaliLabel(row) || "—"}</TableCell>
                  <TableCell>{row.fileNo ?? "—"}</TableCell>
                  <TableCell>{row.name ?? "—"}</TableCell>
                  <TableCell>{rowAddress(row) || "—"}</TableCell>
                  <TableCell>{rowSchedule(row) || "—"}</TableCell>
                </TableRow>
              ))}
              {rawRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    No deliveries (non-service day, inactive thali, paused, or before resume date).
                  </TableCell>
                </TableRow>
              ) : displayRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No rows match this filter.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </>
      ) : null}
    </Paper>
  );
}
