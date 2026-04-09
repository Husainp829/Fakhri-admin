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
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
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
    deliveryMohallah?: string | null;
    deliveryAddress?: string | null;
    thaliType?: { id?: string | null; name?: string | null; code?: string | null } | null;
    fmb?: { itsNo?: string | null; name?: string | null };
  };
};

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
            </Box>
          )}

          <Box>
            <Button variant="text" disabled={loading} onClick={() => void load()}>
              Refresh
            </Button>
          </Box>

          <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Thali</TableCell>
                  <TableCell>ITS</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Mohallah</TableCell>
                  <TableCell>Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary">
                        Loading…
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : isTenantHoliday ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary">
                        No roster on FMB holidays.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : roster.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary">
                        No thalis on your roster for this date. Check assignments, suspensions, and
                        whether this is a service day for each thali.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  roster.map((it) => {
                    const t = it.fmbThali;
                    return (
                      <TableRow key={it.id}>
                        <TableCell>{t?.thaliNo ?? "—"}</TableCell>
                        <TableCell>{t?.fmb?.itsNo ?? "—"}</TableCell>
                        <TableCell>{t?.fmb?.name ?? "—"}</TableCell>
                        <TableCell>{t?.deliveryMohallah ?? "—"}</TableCell>
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
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
