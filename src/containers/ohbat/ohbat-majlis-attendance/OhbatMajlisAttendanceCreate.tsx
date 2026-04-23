import { useCallback, useEffect, useMemo, useState } from "react";
import { Create, useDataProvider, useNotify } from "react-admin";
import type { RaRecord } from "react-admin";
import { useSearchParams } from "react-router-dom";
import startCase from "lodash/startCase";
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
import { fromGregorian } from "@/utils/hijri-date-utils";
import { formatListDate, formatWeekdayFullUtc, parseDayjs } from "@/utils/date-format";
import { formatMajlisStartTimeLabel } from "../ohbat-majlis/OhbatMajlisTime";

const normalizeIts = (s: unknown) => String(s ?? "").trim();

function getHttpStatus(e: unknown): number | undefined {
  if (typeof e === "object" && e !== null) {
    const o = e as { status?: number; statusCode?: number };
    if (typeof o.status === "number") return o.status;
    if (typeof o.statusCode === "number") return o.statusCode;
  }
  return undefined;
}

export default function OhbatMajlisAttendanceCreate() {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [sp] = useSearchParams();
  const presetMajlisId = normalizeIts(sp.get("ohbatMajalisId"));

  const [loading, setLoading] = useState(true);
  const [majlis, setMajlis] = useState<RaRecord | null>(null);
  const [existingIts, setExistingIts] = useState<string[]>([]);

  const existingSet = useMemo(() => new Set(existingIts), [existingIts]);
  const [attendeeItsInput, setAttendeeItsInput] = useState("");
  const [itsFullNameByIts, setItsFullNameByIts] = useState<Record<string, string | null>>({});

  const [saving, setSaving] = useState(false);

  const reload = async () => {
    if (!presetMajlisId) {
      setMajlis(null);
      setExistingIts([]);
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
      const its = rows.map((r) => normalizeIts((r as RaRecord).attendeeIts)).filter(Boolean);
      setExistingIts(its);

      try {
        if (its.length > 0) {
          const { data } = await dataProvider.getMany("itsdata", { ids: its });
          const next: Record<string, string | null> = {};
          (Array.isArray(data) ? data : []).forEach((r) => {
            const row = r as { ITS_ID?: string; Full_Name?: string };
            const k = normalizeIts(row?.ITS_ID);
            if (!k) return;
            next[k] = normalizeIts(row?.Full_Name) || null;
          });
          setItsFullNameByIts(next);
        } else {
          setItsFullNameByIts({});
        }
      } catch {
        setItsFullNameByIts({});
      }
    } catch {
      notify("Could not load majlis attendance context", { type: "warning" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- preset id only
  }, [presetMajlisId]);

  const ensureItsFullName = useCallback(
    async (its: string) => {
      const key = normalizeIts(its);
      if (!key) return null;

      if (Object.prototype.hasOwnProperty.call(itsFullNameByIts, key)) {
        return itsFullNameByIts[key];
      }

      try {
        const { data } = await dataProvider.getMany("itsdata", { ids: [key] });
        const row = Array.isArray(data)
          ? data.find((r) => normalizeIts((r as { ITS_ID?: string }).ITS_ID) === key)
          : null;
        const fullName =
          normalizeIts((row as { Full_Name?: string } | undefined)?.Full_Name) || null;
        setItsFullNameByIts((prev) => ({ ...prev, [key]: fullName }));
        return fullName;
      } catch {
        setItsFullNameByIts((prev) => ({ ...prev, [key]: null }));
        return null;
      }
    },
    [dataProvider, itsFullNameByIts]
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
      } catch (e: unknown) {
        const status = getHttpStatus(e);
        const msg = String(e instanceof Error ? e.message : "");
        if (status === 409 || msg.toLowerCase().includes("already recorded")) {
          notify("Already recorded for this majlis", { type: "info" });
          setAttendeeItsInput("");
          return;
        }
        throw e;
      }
    } catch {
      notify("Failed to save attendance", { type: "error" });
    } finally {
      setSaving(false);
    }
  }, [attendeeItsInput, dataProvider, ensureItsFullName, existingSet, notify, presetMajlisId]);

  return (
    <Create redirect={false} actions={false} title={false}>
      <Box sx={{ px: { xs: 1, sm: 2 }, pb: 2, pt: 1 }}>
        <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
          Majlis Attendance
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
            {isMobile ? (
              <>
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Details ({startCase(String(majlis?.type ?? "")) || "—"})
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  {majlis ? (
                    <Box>
                      <Typography variant="body2">
                        <strong>Host:</strong>{" "}
                        {(majlis.hostName as string) || (majlis.hostItsNo as string) || "—"}
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                        <strong>Venue address:</strong>{" "}
                        {typeof majlis.address === "string" && majlis.address.trim()
                          ? majlis.address.trim()
                          : "—"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Sadarat:</strong>{" "}
                        {(majlis.sadarat as { name?: string } | undefined)?.name || "—"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Date:</strong>{" "}
                        {majlis.date
                          ? `${formatListDate(String(majlis.date), {
                              utc: true,
                            })} · ${formatWeekdayFullUtc(String(majlis.date))} · ${fromGregorian(
                              parseDayjs(String(majlis.date), true).toDate(),
                              "code"
                            )}`
                          : "—"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Time:</strong>{" "}
                        {formatMajlisStartTimeLabel(majlis.startTime as string)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">Majlis not found.</Typography>
                  )}
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      Add attendees by ITS
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap" }}
                    >
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
                          void addAndSave();
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => void addAndSave()}
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
                          const fullName = Object.prototype.hasOwnProperty.call(
                            itsFullNameByIts,
                            key
                          )
                            ? itsFullNameByIts[key]
                            : null;
                          return (
                            <TableRow key={`${its}-${idx}`}>
                              <TableCell sx={{ fontFamily: "monospace" }}>{its}</TableCell>
                              <TableCell>{fullName || "ITS not in jamaat"}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              </>
            ) : (
              <>
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Majlis context ({(majlis?.type as string) || "—"})
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  {majlis ? (
                    <Box>
                      <Typography variant="body2">
                        <strong>Host:</strong>{" "}
                        {(majlis.hostName as string) || (majlis.hostItsNo as string) || "—"}
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                        <strong>Venue address:</strong>{" "}
                        {typeof majlis.address === "string" && majlis.address.trim()
                          ? majlis.address.trim()
                          : "—"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Sadarat:</strong>{" "}
                        {(majlis.sadarat as { name?: string } | undefined)?.name || "—"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Type:</strong> {(majlis.type as string) || "—"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Khidmatguzar:</strong>{" "}
                        {(majlis.khidmatguzar as { Full_Name?: string } | undefined)?.Full_Name ||
                          (majlis.khidmatguzarItsNo as string) ||
                          "—"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Zakereen:</strong>{" "}
                        {(majlis.zakereen as { Full_Name?: string } | undefined)?.Full_Name ||
                          (majlis.zakereenItsNo as string) ||
                          "—"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Date:</strong>{" "}
                        {majlis.date ? formatListDate(String(majlis.date), { utc: true }) : "—"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Day:</strong>{" "}
                        {majlis.date ? formatWeekdayFullUtc(String(majlis.date)) : "—"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Hijri:</strong>{" "}
                        {majlis.date
                          ? fromGregorian(parseDayjs(String(majlis.date), true).toDate(), "code")
                          : "—"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Time:</strong>{" "}
                        {formatMajlisStartTimeLabel(majlis.startTime as string)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">Majlis not found.</Typography>
                  )}
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      Add attendees by ITS
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap" }}
                    >
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
                          void addAndSave();
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => void addAndSave()}
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
                          const fullName = Object.prototype.hasOwnProperty.call(
                            itsFullNameByIts,
                            key
                          )
                            ? itsFullNameByIts[key]
                            : null;
                          return (
                            <TableRow key={`${its}-${idx}`}>
                              <TableCell sx={{ fontFamily: "monospace" }}>{its}</TableCell>
                              <TableCell>{fullName || "ITS not in jamaat"}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              </>
            )}
          </>
        )}
      </Box>
    </Create>
  );
}
