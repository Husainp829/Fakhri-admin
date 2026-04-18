import { useCallback, useEffect, useMemo, useState } from "react";
import { useLogout, useNotify, usePermissions } from "react-admin";
import { Navigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { getApiUrl } from "@/constants";
import { useTenantBrandedThemes } from "@/hooks/useTenantBrandedThemes";
import type { PermissionRecord } from "@/types/permissions";
import { shouldRedirectToDistributorPortal } from "@/utils/permission-utils";
import httpClient from "@/dataprovider/http-client";

type PortalMeta = { code: string; name: string; timezone: string | null };

type ThaliTypeRow = { id: string; code: string; name: string; sortOrder: number };

type RosterRow = {
  id: string;
  fmbThali?: {
    thaliNo?: string | null;
    deliveryAddress?: string | null;
    thaliType?: { id?: string | null; name?: string | null; code?: string | null } | null;
    fmb?: { itsNo?: string | null; name?: string | null };
  };
};

type RosterSortCol = "thali" | "its" | "name" | "address";

function rosterSortKey(it: RosterRow, col: RosterSortCol): string {
  const t = it.fmbThali;
  switch (col) {
    case "thali":
      return (t?.thaliNo ?? "").toLowerCase();
    case "its":
      return (t?.fmb?.itsNo ?? "").toLowerCase();
    case "name":
      return (t?.fmb?.name ?? "").toLowerCase();
    case "address":
      return (t?.deliveryAddress ?? "").toLowerCase();
    default:
      return "";
  }
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

function todayYmdUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function FmbDistributorPortalPage() {
  const tenantThemes = useTenantBrandedThemes();
  const theme = useMemo(() => createTheme(tenantThemes.light), [tenantThemes]);
  const isNarrow = useMediaQuery(theme.breakpoints.down("md"));

  const { permissions, isLoading: permissionsLoading } = usePermissions<PermissionRecord>();

  const notify = useNotify();
  const logout = useLogout();
  const [date, setDate] = useState(todayYmdUtc);
  const [meta, setMeta] = useState<PortalMeta | null>(null);
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [thaliTypes, setThaliTypes] = useState<ThaliTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTenantHoliday, setIsTenantHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState<string | null>(null);
  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterSortBy, setRosterSortBy] = useState<RosterSortCol>("thali");
  const [rosterSortDir, setRosterSortDir] = useState<"asc" | "desc">("asc");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [metaRes, runRes, typesRes] = await Promise.all([
        httpClient(`${getApiUrl()}/fmbDistributorPortal/meta`, { method: "GET" }),
        httpClient(
          `${getApiUrl()}/fmbDistributorPortal/daily-run?${new URLSearchParams({ date }).toString()}`,
          { method: "GET" }
        ),
        httpClient(`${getApiUrl()}/fmbDistributorPortal/thali-types`, { method: "GET" }),
      ]);
      setMeta(metaRes.json as PortalMeta);
      const runJson = runRes.json as {
        isTenantHoliday?: boolean;
        holidayName?: string | null;
      };
      setIsTenantHoliday(Boolean(runJson.isTenantHoliday));
      setHolidayName(
        typeof runJson.holidayName === "string" || runJson.holidayName === null
          ? runJson.holidayName
          : null
      );
      setRoster(rowsFromResponse(runRes.json) as RosterRow[]);
      setThaliTypes(rowsFromResponse(typesRes.json) as ThaliTypeRow[]);
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Failed to load roster", { type: "warning" });
    } finally {
      setLoading(false);
    }
  }, [date, notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const displayRoster = useMemo(() => {
    const q = rosterSearch.trim().toLowerCase();
    let rows = roster;
    if (q) {
      rows = rows.filter((it) => {
        const t = it.fmbThali;
        const hay = [
          t?.thaliNo,
          t?.fmb?.itsNo,
          t?.fmb?.name,
          t?.deliveryAddress,
          t?.thaliType?.name,
          t?.thaliType?.code,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    const dir = rosterSortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = rosterSortKey(a, rosterSortBy);
      const vb = rosterSortKey(b, rosterSortBy);
      const cmp = va.localeCompare(vb, undefined, { numeric: true, sensitivity: "base" });
      if (cmp !== 0) return cmp * dir;
      return a.id.localeCompare(b.id);
    });
  }, [roster, rosterSearch, rosterSortBy, rosterSortDir]);

  const requestRosterSort = (col: RosterSortCol) => {
    if (rosterSortBy === col) {
      setRosterSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setRosterSortBy(col);
      setRosterSortDir("asc");
    }
  };

  /** Counts per tenant thali type for this roster; `other` = missing or inactive type on thali. */
  const kitchenPickupByThaliType = useMemo(() => {
    const byId = new Map<string, number>();
    for (const t of thaliTypes) {
      byId.set(t.id, 0);
    }
    let other = 0;
    for (const it of roster) {
      const typeId = it.fmbThali?.thaliType?.id ?? null;
      if (typeId && byId.has(typeId)) {
        byId.set(typeId, (byId.get(typeId) ?? 0) + 1);
      } else {
        other += 1;
      }
    }
    return { byId, other };
  }, [roster, thaliTypes]);

  if (permissionsLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40vh",
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (!shouldRedirectToDistributorPortal(permissions)) {
    return <Navigate to="/" replace />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" elevation={1} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Thali distribution
          </Typography>
          <Button color="inherit" onClick={() => void logout()}>
            Log out
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, maxWidth: 1200, mx: "auto" }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <TextField
              label="Service date"
              type="date"
              size="small"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
            />
            {meta && (
              <Typography variant="body1" color="text.secondary">
                {meta.name}
              </Typography>
            )}
          </Stack>

          {isTenantHoliday && (
            <Alert severity="info">
              {holidayName
                ? `Tenant FMB holiday: ${holidayName}. No delivery roster for this date.`
                : "Tenant FMB holiday — no delivery roster for this date."}
            </Alert>
          )}

          {!isTenantHoliday && (
            <Chip size="small" label={`Roster: ${roster.length} thali(s)`} variant="outlined" />
          )}

          {!loading && !isTenantHoliday && (thaliTypes.length > 0 || roster.length > 0) && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                Pick up from kitchen
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Counts by thali type (active types from admin settings).
              </Typography>
              {isNarrow ? (
                <Stack spacing={1} sx={{ maxWidth: 480 }}>
                  {thaliTypes.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No active thali types are configured for this jamaat.
                      </Typography>
                    </Paper>
                  ) : (
                    <>
                      {thaliTypes.map((t) => (
                        <Paper
                          key={t.id}
                          variant="outlined"
                          sx={{
                            px: 2,
                            py: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                          }}
                        >
                          <Typography variant="body2">{t.name}</Typography>
                          <Typography
                            variant="body2"
                            sx={(th) => ({ fontWeight: th.typography.fontWeightMedium })}
                          >
                            {kitchenPickupByThaliType.byId.get(t.id) ?? 0}
                          </Typography>
                        </Paper>
                      ))}
                      {kitchenPickupByThaliType.other > 0 && (
                        <Paper
                          variant="outlined"
                          sx={{
                            px: 2,
                            py: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Unspecified or inactive type
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={(th) => ({ fontWeight: th.typography.fontWeightMedium })}
                          >
                            {kitchenPickupByThaliType.other}
                          </Typography>
                        </Paper>
                      )}
                      <Paper
                        variant="outlined"
                        sx={{
                          px: 2,
                          py: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          borderTop: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={(th) => ({ fontWeight: th.typography.fontWeightMedium })}
                        >
                          Total
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={(th) => ({ fontWeight: th.typography.fontWeightMedium })}
                        >
                          {roster.length}
                        </Typography>
                      </Paper>
                    </>
                  )}
                </Stack>
              ) : (
                <TableContainer
                  sx={{ border: 1, borderColor: "divider", borderRadius: 1, maxWidth: 480 }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Thali type</TableCell>
                        <TableCell align="right">Thalis</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {thaliTypes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2}>
                            <Typography variant="body2" color="text.secondary">
                              No active thali types are configured for this jamaat.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        thaliTypes.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>{t.name}</TableCell>
                            <TableCell align="right">
                              {kitchenPickupByThaliType.byId.get(t.id) ?? 0}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      {kitchenPickupByThaliType.other > 0 && (
                        <TableRow>
                          <TableCell>Unspecified or inactive type</TableCell>
                          <TableCell align="right">{kitchenPickupByThaliType.other}</TableCell>
                        </TableRow>
                      )}
                      <TableRow
                        sx={(t) => ({
                          "& td": {
                            fontWeight: t.typography.fontWeightMedium,
                            borderTop: 1,
                            borderColor: "divider",
                          },
                        })}
                      >
                        <TableCell>Total</TableCell>
                        <TableCell align="right">{roster.length}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          <Box>
            <Button variant="text" disabled={loading} onClick={() => void load()}>
              Refresh
            </Button>
          </Box>

          {!loading && !isTenantHoliday && roster.length > 0 ? (
            <TextField
              label="Filter roster"
              placeholder="Thali, ITS, name, address…"
              size="small"
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
              sx={{ maxWidth: 400, mb: 1 }}
              fullWidth
            />
          ) : null}

          {isNarrow ? (
            <Stack spacing={1.5}>
              {loading ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading…
                  </Typography>
                </Paper>
              ) : isTenantHoliday ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No roster on FMB holidays.
                  </Typography>
                </Paper>
              ) : roster.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No thalis on your roster for this date. Check assignments, suspensions, and
                    whether this is a service day for each thali.
                  </Typography>
                </Paper>
              ) : displayRoster.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No rows match this filter.
                  </Typography>
                </Paper>
              ) : (
                displayRoster.map((it) => {
                  const t = it.fmbThali;
                  return (
                    <Paper key={it.id} variant="outlined" sx={{ p: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={(th) => ({ fontWeight: th.typography.fontWeightMedium })}
                      >
                        Thali {t?.thaliNo ?? "—"}
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 1.5 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Name
                          </Typography>
                          <Typography variant="body2">{t?.fmb?.name ?? "—"}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            ITS
                          </Typography>
                          <Typography variant="body2">{t?.fmb?.itsNo ?? "—"}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Address
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "normal", wordBreak: "break-word" }}
                          >
                            {t?.deliveryAddress ?? "—"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })
              )}
            </Stack>
          ) : (
            <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={rosterSortBy === "thali"}
                        direction={rosterSortBy === "thali" ? rosterSortDir : "asc"}
                        onClick={() => requestRosterSort("thali")}
                      >
                        Thali
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={rosterSortBy === "its"}
                        direction={rosterSortBy === "its" ? rosterSortDir : "asc"}
                        onClick={() => requestRosterSort("its")}
                      >
                        ITS
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={rosterSortBy === "name"}
                        direction={rosterSortBy === "name" ? rosterSortDir : "asc"}
                        onClick={() => requestRosterSort("name")}
                      >
                        Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={rosterSortBy === "address"}
                        direction={rosterSortBy === "address" ? rosterSortDir : "asc"}
                        onClick={() => requestRosterSort("address")}
                      >
                        Address
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary">
                          Loading…
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : isTenantHoliday ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary">
                          No roster on FMB holidays.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : roster.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary">
                          No thalis on your roster for this date. Check assignments, suspensions,
                          and whether this is a service day for each thali.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : displayRoster.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary">
                          No rows match this filter.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayRoster.map((it) => {
                      const t = it.fmbThali;
                      return (
                        <TableRow key={it.id}>
                          <TableCell>{t?.thaliNo ?? "—"}</TableCell>
                          <TableCell>{t?.fmb?.itsNo ?? "—"}</TableCell>
                          <TableCell>{t?.fmb?.name ?? "—"}</TableCell>
                          <TableCell
                            sx={{ maxWidth: 280, whiteSpace: "normal", wordBreak: "break-word" }}
                          >
                            {t?.deliveryAddress ?? "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
