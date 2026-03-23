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
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import httpClient from "../../../dataprovider/httpClient";
import { getApiUrl } from "../../../constants";

export default function DailySummarySection() {
  const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const q = `${getApiUrl()}/fmbThaliSuspension/daily-summary?date=${encodeURIComponent(date)}`;
    httpClient(q)
      .then(({ json }) => setPayload(json))
      .catch((e) => setError(e?.message || "Request failed"))
      .finally(() => setLoading(false));
  }, [date]);

  const rows = payload?.rows ?? [];
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
      {!meta?.isTenantHoliday && payload ? (
        <>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Deliveries expected: {meta.count}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Thaali no.</TableCell>
                <TableCell>Schedule</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.fmbNo ?? row.id}</TableCell>
                  <TableCell>
                    {row.deliveryScheduleProfile
                      ? `${row.deliveryScheduleProfile.code} — ${row.deliveryScheduleProfile.name}`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2}>
                    No deliveries (non-service day, inactive thali, or all suspended).
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </>
      ) : null}
    </Paper>
  );
}
