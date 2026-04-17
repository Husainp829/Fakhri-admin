import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useDataProvider,
  useNotify,
  usePermissions,
  useRefresh,
  type DataProvider,
} from "react-admin";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import { alpha } from "@mui/material/styles";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { mapThaliRowForApi } from "../common/thali-map";
import { getFmbTakhmeenYearFromGregorian } from "@/utils/hijri-date-utils";
import { hasPermission } from "@/utils/permission-utils";
import {
  buildValidatedPreviewRows,
  parseFmbDataCsvFileToPreview,
  previewCanImport,
  previewRowsToBundles,
  type CsvPreviewField,
  type FmbDataCsvHouseholdBundle,
  type FmbDataCsvPreviewPayload,
  type FmbDataCsvPreviewRow,
  type FmbThaliTypeForCsv,
} from "./parse-fmb-data-csv";

function normalizeTypeLabel(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\u2014/g, "-")
    .replace(/[—–]/g, "-")
    .replace(/\s+/g, " ");
}

function resolveThaliTypeId(label: string, types: FmbThaliTypeForCsv[]): string | undefined {
  const t = label.trim();
  if (!t) return undefined;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)) {
    return types.some((r) => r.id === t) ? t : undefined;
  }
  const norm = normalizeTypeLabel(t);
  for (const row of types) {
    if (normalizeTypeLabel(row.code) === norm) return row.id;
    if (normalizeTypeLabel(row.name) === norm) return row.id;
    if (normalizeTypeLabel(`${row.code} — ${row.name}`) === norm) return row.id;
    if (normalizeTypeLabel(`${row.code} - ${row.name}`) === norm) return row.id;
  }
  return undefined;
}

async function fetchAllThaliTypes(dataProvider: DataProvider): Promise<FmbThaliTypeForCsv[]> {
  const perPage = 500;
  const out: FmbThaliTypeForCsv[] = [];
  let page = 1;
  for (;;) {
    const { data, total = 0 } = await dataProvider.getList("fmbThaliType", {
      pagination: { page, perPage },
      sort: { field: "sortOrder", order: "ASC" },
      filter: {},
    });
    const chunk = (data ?? []) as FmbThaliTypeForCsv[];
    out.push(...chunk);
    if (chunk.length < perPage || out.length >= total) break;
    page += 1;
  }
  return out;
}

function buildCreatePayload(
  bundle: FmbDataCsvHouseholdBundle,
  thaliTypes: FmbThaliTypeForCsv[],
  hijriYearStart: number
): { payload: Record<string, unknown>; errors: string[] } {
  const errors: string[] = [];
  const thalis = bundle.thalis.map((th) => {
    const thaliTypeId = resolveThaliTypeId(th.thaliTypeLabel, thaliTypes);
    if (!thaliTypeId) {
      errors.push(`Row ${th.rowNumber}: unknown Thali Type "${th.thaliTypeLabel}".`);
    }
    return mapThaliRowForApi(
      {
        thaliNo: th.thaliNo,
        thaliTypeId: thaliTypeId ?? null,
        deliveryAddress: th.deliveryAddress,
        tags: th.tags,
        isActive: true,
      },
      { isCreate: true }
    );
  });
  if (errors.length) {
    return { payload: {}, errors };
  }
  return {
    payload: {
      itsNo: bundle.itsNo?.trim() || undefined,
      name: bundle.name.trim() || undefined,
      mobileNo: bundle.mobile.trim() || undefined,
      takhmeenAmount: bundle.takhmeenAmount,
      hijriYearStart,
      thalis,
    },
    errors: [],
  };
}

const PREVIEW_COLUMNS: {
  field: CsvPreviewField | "row" | "issues";
  label: string;
  minWidth?: number;
}[] = [
  { field: "row", label: "Row", minWidth: 48 },
  { field: "thaliNo", label: "Thaali No", minWidth: 88 },
  { field: "itsNo", label: "ITS", minWidth: 88 },
  { field: "name", label: "Name", minWidth: 100 },
  { field: "deliveryAddress", label: "Address", minWidth: 140 },
  { field: "thaliType", label: "Thali Type", minWidth: 100 },
  { field: "mobile", label: "Mobile", minWidth: 88 },
  { field: "takhmeen", label: "Takhmeen", minWidth: 72 },
  { field: "tags", label: "Tags", minWidth: 100 },
  { field: "issues", label: "Issues", minWidth: 160 },
];

function fieldCellErrors(row: FmbDataCsvPreviewRow, field: CsvPreviewField): string[] {
  return row.cellErrors[field] ?? [];
}

function formatTakhmeen(row: FmbDataCsvPreviewRow): string {
  if (row.takhmeenAmount != null) return String(row.takhmeenAmount);
  return "—";
}

function formatIssues(row: FmbDataCsvPreviewRow): string {
  const cell = (Object.keys(row.cellErrors) as CsvPreviewField[])
    .flatMap((f) => (row.cellErrors[f] ?? []).map((m) => `${f}: ${m}`))
    .filter(Boolean);
  const all = [...cell, ...row.rowErrors];
  return all.length ? all.join("; ") : "—";
}

function rowHasAnyIssue(row: FmbDataCsvPreviewRow): boolean {
  return !previewCanImport([row]);
}

export function FmbDataCsvImportButton() {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const { permissions } = usePermissions();
  const canImport = hasPermission(permissions, "fmbData.create");

  const [open, setOpen] = useState(false);
  const [previewPayload, setPreviewPayload] = useState<FmbDataCsvPreviewPayload | null>(null);
  const [parseFatal, setParseFatal] = useState<string[] | null>(null);
  const [fileLabel, setFileLabel] = useState("");
  const [thaliTypes, setThaliTypes] = useState<FmbThaliTypeForCsv[] | null>(null);
  const [typesError, setTypesError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [lastLog, setLastLog] = useState<string[]>([]);

  const hijriYearStart = React.useMemo(() => getFmbTakhmeenYearFromGregorian(new Date()), []);

  useEffect(() => {
    if (!open || !canImport) return;
    let alive = true;
    setThaliTypes(null);
    setTypesError(null);
    (async () => {
      try {
        const types = await fetchAllThaliTypes(dataProvider);
        if (!alive) return;
        setThaliTypes(types);
      } catch {
        if (!alive) return;
        setThaliTypes([]);
        setTypesError("Could not load thali types; type matching is unavailable until you retry.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, canImport, dataProvider]);

  const validatedRows = useMemo(() => {
    if (!previewPayload?.rows) return null;
    return buildValidatedPreviewRows(previewPayload.rows, thaliTypes, resolveThaliTypeId);
  }, [previewPayload, thaliTypes]);

  const issueCount = useMemo(() => {
    if (!validatedRows) return 0;
    return validatedRows.filter((r) => rowHasAnyIssue(r)).length;
  }, [validatedRows]);

  const canSubmitImport =
    Boolean(validatedRows?.length) &&
    thaliTypes !== null &&
    validatedRows != null &&
    previewCanImport(validatedRows);

  const resetFileInput = useCallback((el: HTMLInputElement | null) => {
    if (el) el.value = "";
  }, []);

  const handleClose = () => {
    if (importing) return;
    setOpen(false);
    setPreviewPayload(null);
    setParseFatal(null);
    setFileLabel("");
    setLastLog([]);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLabel(file.name);
    setLastLog([]);
    setParseFatal(null);
    setPreviewPayload(null);
    try {
      const res = await parseFmbDataCsvFileToPreview(file);
      if (!res.ok) {
        setParseFatal(res.errors);
        notify(res.errors[0] ?? "Could not read CSV", { type: "error" });
      } else {
        setPreviewPayload(res.data);
      }
    } catch {
      setParseFatal(["Failed to read the file."]);
      notify("Failed to read the file", { type: "error" });
    }
    e.target.value = "";
  };

  const runImport = async () => {
    if (!validatedRows || !previewCanImport(validatedRows) || !thaliTypes) return;
    setImporting(true);
    setLastLog([]);
    const bundles = previewRowsToBundles(validatedRows);
    const log: string[] = [];
    let ok = 0;
    let fail = 0;
    try {
      setImportProgress({ done: 0, total: bundles.length });
      for (let i = 0; i < bundles.length; i += 1) {
        const bundle = bundles[i]!;
        const { payload, errors } = buildCreatePayload(bundle, thaliTypes, hijriYearStart);
        if (errors.length) {
          fail += 1;
          log.push(`Skipped (ITS ${bundle.itsNo ?? "—"}): ${errors.join(" ")}`);
        } else {
          try {
            await dataProvider.create("fmbData", { data: payload });
            ok += 1;
          } catch (err: unknown) {
            fail += 1;
            const msg =
              err instanceof Error ? err.message : typeof err === "string" ? err : "Create failed";
            log.push(`Failed (ITS ${bundle.itsNo ?? "—"}): ${msg}`);
          }
        }
        setImportProgress({ done: i + 1, total: bundles.length });
      }
      setLastLog(log);
      if (ok > 0) {
        notify(
          `Imported ${ok} FMB record${ok === 1 ? "" : "s"}${fail ? `, ${fail} failed` : ""}.`,
          {
            type: fail ? "warning" : "success",
          }
        );
        refresh();
      } else if (fail > 0) {
        notify("No records were imported.", { type: "warning" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Import failed";
      notify(msg, { type: "error" });
    } finally {
      setImporting(false);
      setImportProgress({ done: 0, total: 0 });
    }
  };

  const cellSx = (row: FmbDataCsvPreviewRow, field: CsvPreviewField) => {
    const errs = fieldCellErrors(row, field);
    if (!errs.length) return undefined;
    return (theme: { palette: { error: { main: string }; mode: string } }) => ({
      bgcolor: alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.22 : 0.12),
      verticalAlign: "top",
    });
  };

  if (!canImport) {
    return null;
  }

  return (
    <>
      <Button
        startIcon={<UploadFileIcon />}
        onClick={() => {
          setOpen(true);
          setPreviewPayload(null);
          setParseFatal(null);
          setFileLabel("");
          setLastLog([]);
        }}
        size="small"
      >
        Import CSV
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>Import FMB data from CSV</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            Required columns: <strong>Thaali No, ITS, Name, Address, Thali Type, Mobile</strong>{" "}
            (header <strong>Delivery Address</strong> is also accepted). Optional:{" "}
            <strong>Takhmeen Amount</strong> (defaults to <strong>0</strong> per household when
            empty), <strong>Tags</strong> (comma or semicolon separated; max 50 tags, 100 characters
            each).
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Thali Type</strong> must match an existing type (id, code, name, or{" "}
            <code>CODE — Name</code>). Rows with the same ITS become one FMB record with multiple
            thalis. Review the preview and fix highlighted cells before importing.
          </Typography>
          <Button variant="outlined" component="label" size="small" disabled={importing}>
            Choose CSV file
            <input
              key={open ? "open" : "closed"}
              type="file"
              accept=".csv,text/csv"
              hidden
              ref={resetFileInput}
              onChange={handleFile}
            />
          </Button>
          {fileLabel ? (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {fileLabel}
            </Typography>
          ) : null}

          {typesError ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {typesError}
            </Alert>
          ) : null}

          {parseFatal?.length ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {parseFatal.join(" ")}
            </Alert>
          ) : null}

          {previewPayload && validatedRows ? (
            <>
              <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                Preview: <strong>{validatedRows.length}</strong> data row
                {validatedRows.length === 1 ? "" : "s"}
                {previewPayload.skippedEmptyRows > 0
                  ? ` (${previewPayload.skippedEmptyRows} blank skipped)`
                  : ""}
                .
                {thaliTypes === null ? <strong> Loading thali types for validation…</strong> : null}
              </Typography>
              {thaliTypes === null ? (
                <Alert severity="info" sx={{ mb: 1 }}>
                  Thali type matching runs after types finish loading. Import stays disabled until
                  then.
                </Alert>
              ) : issueCount > 0 ? (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {issueCount} row{issueCount === 1 ? "" : "s"} have validation issues
                  (highlighted). Import stays disabled until every row is clean.
                </Alert>
              ) : validatedRows.length > 0 ? (
                <Alert severity="success" sx={{ mb: 1 }}>
                  All rows pass validation. You can import.
                </Alert>
              ) : null}
              <TableContainer
                sx={{ maxHeight: 420, border: 1, borderColor: "divider", borderRadius: 1 }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {PREVIEW_COLUMNS.map((col) => (
                        <TableCell
                          key={col.field}
                          sx={{ fontWeight: 600 }}
                          style={{ minWidth: col.minWidth }}
                        >
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {validatedRows.map((row) => {
                      const dirty = rowHasAnyIssue(row);
                      return (
                        <TableRow
                          key={row.rowNumber}
                          sx={dirty ? { bgcolor: "action.hover" } : undefined}
                        >
                          <TableCell>{row.rowNumber}</TableCell>
                          <TableCell sx={cellSx(row, "thaliNo")}>{row.thaliNo || "—"}</TableCell>
                          <TableCell sx={cellSx(row, "itsNo")}>{row.itsNo || "—"}</TableCell>
                          <TableCell sx={cellSx(row, "name")}>{row.name || "—"}</TableCell>
                          <TableCell sx={cellSx(row, "deliveryAddress")}>
                            {row.deliveryAddress || "—"}
                          </TableCell>
                          <TableCell sx={cellSx(row, "thaliType")}>
                            {row.thaliTypeLabel || "—"}
                          </TableCell>
                          <TableCell sx={cellSx(row, "mobile")}>{row.mobile || "—"}</TableCell>
                          <TableCell sx={cellSx(row, "takhmeen")}>{formatTakhmeen(row)}</TableCell>
                          <TableCell sx={cellSx(row, "tags")}>
                            {row.tagsRaw.trim() ? row.tagsRaw : "—"}
                          </TableCell>
                          <TableCell
                            sx={
                              dirty
                                ? (theme) => ({
                                    color: theme.palette.error.main,
                                    fontWeight: 500,
                                    verticalAlign: "top",
                                  })
                                : undefined
                            }
                          >
                            {formatIssues(row)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : null}

          {importing && importProgress.total > 0 ? (
            <LinearProgress
              variant="determinate"
              value={(100 * importProgress.done) / importProgress.total}
              sx={{ mt: 2 }}
            />
          ) : null}

          {lastLog.length > 0 ? (
            <Typography
              component="pre"
              variant="caption"
              sx={{ mt: 2, whiteSpace: "pre-wrap", fontFamily: "inherit" }}
            >
              {lastLog.join("\n")}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={importing}>
            Close
          </Button>
          <Button variant="contained" onClick={runImport} disabled={!canSubmitImport || importing}>
            {importing ? "Importing…" : "Import"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
