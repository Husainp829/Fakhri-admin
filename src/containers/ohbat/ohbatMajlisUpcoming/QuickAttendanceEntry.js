import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDataProvider, useNotify } from "react-admin";
import dayjs from "dayjs";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const normalizeIts = (s) => String(s ?? "").trim();

export default function QuickAttendanceEntry({ ohbatMajalisId }) {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const presetMajlisId = normalizeIts(ohbatMajalisId);

  const [loading, setLoading] = useState(true);
  const [majlis, setMajlis] = useState(null);
  const [existingIts, setExistingIts] = useState([]);
  const existingSet = useMemo(() => new Set(existingIts), [existingIts]);

  const [itsFullNameByIts, setItsFullNameByIts] = useState({});
  const [attendeeItsInput, setAttendeeItsInput] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    if (!presetMajlisId) {
      setMajlis(null);
      setExistingIts([]);
      setItsFullNameByIts({});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [majlisRes, attendanceRes] = await Promise.all([
        dataProvider.getOne("ohbatMajalis", { id: presetMajlisId }),
        dataProvider.getList("ohbatMajlisAttendance", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "createdAt", order: "DESC" },
          filter: { ohbatMajalisId: presetMajlisId },
        }),
      ]);

      setMajlis(majlisRes.data);

      const rows = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
      const its = rows.map((r) => normalizeIts(r.attendeeIts)).filter(Boolean);
      setExistingIts(its);

      // Preload itsdata names for quick display in this modal.
      try {
        if (its.length > 0) {
          const { data } = await dataProvider.getMany("itsdata", { ids: its });
          const next = {};
          (Array.isArray(data) ? data : []).forEach((r) => {
            const k = normalizeIts(r?.ITS_ID);
            if (!k) return;
            next[k] = normalizeIts(r?.Full_Name) || null;
          });
          setItsFullNameByIts(next);
        } else {
          setItsFullNameByIts({});
        }
      } catch (e) {
        setItsFullNameByIts({});
      }
    } catch (e) {
      notify("Could not load majlis attendance context", { type: "warning" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetMajlisId]);

  const ensureItsFullName = useCallback(
    async (its) => {
      const key = normalizeIts(its);
      if (!key) return null;

      if (Object.prototype.hasOwnProperty.call(itsFullNameByIts, key)) {
        return itsFullNameByIts[key];
      }

      try {
        const { data } = await dataProvider.getMany("itsdata", { ids: [key] });
        const row = Array.isArray(data) ? data.find((r) => normalizeIts(r?.ITS_ID) === key) : null;
        const fullName = normalizeIts(row?.Full_Name) || null;
        setItsFullNameByIts((prev) => ({ ...prev, [key]: fullName }));
        return fullName;
      } catch (e) {
        setItsFullNameByIts((prev) => ({ ...prev, [key]: null }));
        return null;
      }
    },
    [dataProvider, itsFullNameByIts, notify],
  );

  const addAndSave = useCallback(async () => {
    const v = normalizeIts(attendeeItsInput);
    if (!v) return;
    if (!presetMajlisId) {
      notify("Majlis id is missing", { type: "warning" });
      return;
    }

    setSaving(true);
    try {
      if (existingSet.has(v)) {
        notify("Already recorded for this majlis", { type: "info" });
        setAttendeeItsInput("");
        return;
      }

      try {
        await dataProvider.create("ohbatMajlisAttendance", {
          data: {
            ohbatMajalisId: presetMajlisId,
            attendeeIts: v,
          },
        });

        setExistingIts((prev) => (prev.includes(v) ? prev : [v, ...prev]));
        await ensureItsFullName(v);
        notify("Attendance recorded", { type: "success" });
        setAttendeeItsInput("");
      } catch (e) {
        const status = e?.status ?? e?.statusCode;
        const msg = String(e?.message ?? "");
        if (status === 409 || msg.toLowerCase().includes("already recorded")) {
          notify("Already recorded for this majlis", { type: "info" });
          setAttendeeItsInput("");
          return;
        }
        throw e;
      }
    } catch (e) {
      notify("Failed to save attendance", { type: "error" });
    } finally {
      setSaving(false);
    }
  }, [
    attendeeItsInput,
    dataProvider,
    ensureItsFullName,
    existingSet,
    notify,
    presetMajlisId,
  ]);

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, pb: 2, pt: 1 }}>
      <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
        Quick attendance
      </Typography>

      {!presetMajlisId && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography color="error">`ohbatMajalisId` is required.</Typography>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Majlis context
            </Typography>
            <Divider sx={{ my: 1 }} />
            {majlis ? (
              <Box>
                <Typography variant="body2">
                  <strong>Host:</strong> {majlis.hostName || majlis.hostItsNo || "—"}
                </Typography>
                <Typography variant="body2">
                  <strong>Sadarat:</strong> {majlis.sadarat?.name || "—"}
                </Typography>
                <Typography variant="body2">
                  <strong>Khidmatguzar:</strong>{" "}
                  {majlis.khidmatguzar?.Full_Name || majlis.khidmatguzarItsNo || "—"}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong>{" "}
                  {majlis.date ? dayjs.utc(majlis.date).format("DD - MMM - YYYY") : "—"}
                </Typography>
                <Typography variant="body2">
                  <strong>Slot:</strong> {majlis.slot || "—"}
                </Typography>
              </Box>
            ) : (
              <Typography color="text.secondary">Majlis not found.</Typography>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Add attendees by ITS
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                Recorded: {existingIts.length}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <TextField
                value={attendeeItsInput}
                onChange={(e) => setAttendeeItsInput(e.target.value)}
                label="Attendee ITS"
                fullWidth
                disabled={saving}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAndSave();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={addAndSave}
                disabled={saving || !attendeeItsInput.trim()}
              >
                Add
              </Button>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ITS</TableCell>
                  <TableCell>Full name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {existingIts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ color: "text.secondary" }}>
                      No attendance recorded yet. Add an ITS.
                    </TableCell>
                  </TableRow>
                ) : (
                  existingIts.map((its, idx) => {
                    const key = normalizeIts(its);
                    const fullName = Object.prototype.hasOwnProperty.call(itsFullNameByIts, key)
                      ? itsFullNameByIts[key]
                      : null;
                    return (
                      <TableRow key={`${its}-${idx}`}>
                        <TableCell sx={{ fontFamily: "monospace" }}>{its}</TableCell>
                        <TableCell>{fullName || "ITS Not is jamaat"}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  );
}
