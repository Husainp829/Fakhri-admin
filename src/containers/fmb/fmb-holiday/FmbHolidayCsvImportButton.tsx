import React, { useRef, useState } from "react";
import { useNotify, usePermissions, useRefresh } from "react-admin";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { getApiUrl } from "@/constants";
import httpClient from "@/dataprovider/http-client";
import type { PermissionRecord } from "@/types/permissions";
import { hasAnyPermission } from "@/utils/permission-utils";
import { parseFmbHolidayCsv } from "./parse-fmb-holiday-csv";

type ImportResult = {
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  detectedDateHeader: string;
  detectedNameHeader: string | null;
  errors: { rowNumber: number; message: string }[];
};

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsText(file);
  });
}

export function FmbHolidayCsvImportButton() {
  const notify = useNotify();
  const refresh = useRefresh();
  const { permissions } = usePermissions<PermissionRecord>();
  const canImport = hasAnyPermission(permissions, ["fmbHoliday.create", "fmbHoliday.edit"]);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastResult, setLastResult] = useState<ImportResult | null>(null);

  if (!canImport) {
    return null;
  }

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }
    setBusy(true);
    setLastResult(null);
    try {
      const text = await readFileAsText(file);
      let parsed;
      try {
        parsed = parseFmbHolidayCsv(text);
      } catch (err) {
        notify(err instanceof Error ? err.message : "Invalid CSV", { type: "error" });
        return;
      }

      const rowsPayload = parsed.rows.map((r) => ({
        holidayDate: r.holidayDateYmd,
        name: r.name,
        sourceRowNumber: r.sourceRowNumber,
      }));

      if (rowsPayload.length === 0) {
        const parseErrs = parsed.parseErrors.map((pe) => ({
          rowNumber: pe.rowNumber,
          message: pe.message,
        }));
        setLastResult({
          created: 0,
          updated: 0,
          unchanged: 0,
          skipped: parsed.skippedBlankRows,
          detectedDateHeader: parsed.detectedDateHeader,
          detectedNameHeader: parsed.detectedNameHeader,
          errors: parseErrs,
        });
        notify(
          parseErrs.length > 0
            ? `No valid rows to import (${parseErrs.length} issue(s)).`
            : "No valid rows to import.",
          { type: "warning" }
        );
        return;
      }

      const headers = new Headers();
      headers.set("Content-Type", "application/json");

      const { json } = await httpClient(`${getApiUrl()}/fmbHoliday/bulk-import`, {
        method: "POST",
        headers,
        body: JSON.stringify({ rows: rowsPayload }),
      });

      const body = json as Partial<ImportResult> & {
        message?: string | string[];
        errors?: { rowNumber: number; message: string }[];
      };

      const serverErrors = Array.isArray(body.errors) ? body.errors : [];
      const parseErrs = parsed.parseErrors.map((pe) => ({
        rowNumber: pe.rowNumber,
        message: pe.message,
      }));
      const mergedErrors = [...parseErrs, ...serverErrors];

      const result: ImportResult = {
        created: body.created ?? 0,
        updated: body.updated ?? 0,
        unchanged: body.unchanged ?? 0,
        skipped: parsed.skippedBlankRows,
        detectedDateHeader: parsed.detectedDateHeader,
        detectedNameHeader: parsed.detectedNameHeader,
        errors: mergedErrors,
      };
      setLastResult(result);

      const touched = result.created + result.updated;
      if (touched > 0) {
        notify(`Imported ${result.created} new, updated ${result.updated} holiday(s).`, {
          type: "success",
        });
      } else if (mergedErrors.length > 0) {
        notify(`No changes applied. ${mergedErrors.length} row issue(s).`, { type: "warning" });
      } else {
        notify("No changes applied (dates unchanged or already up to date).", { type: "info" });
      }
      refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Import failed", { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        startIcon={<UploadFileIcon />}
        onClick={() => {
          setLastResult(null);
          setOpen(true);
        }}
        size="small"
        variant="outlined"
      >
        Import CSV
      </Button>
      <input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={onUpload} />
      <Dialog open={open} onClose={() => !busy && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import FMB holidays from CSV</DialogTitle>
        <DialogContent>
          {busy ? <LinearProgress sx={{ my: 1 }} /> : null}
          <Alert severity="info" sx={{ mb: 2 }}>
            The file is parsed in your browser; only normalized dates and names are sent to the
            server (not the raw CSV). Required column:{" "}
            <Typography component="span" variant="body2" sx={{ fontFamily: "monospace" }}>
              holiday_date
            </Typography>
            ,{" "}
            <Typography component="span" variant="body2" sx={{ fontFamily: "monospace" }}>
              date
            </Typography>
            , or similar. Optional:{" "}
            <Typography component="span" variant="body2" sx={{ fontFamily: "monospace" }}>
              name
            </Typography>
            . Dates may be YYYY-MM-DD or DD/MM/YYYY. Duplicate dates in the file use the last row.
          </Alert>
          <Typography variant="body2" sx={{ mb: 1, fontFamily: "monospace" }}>
            holiday_date,name
            <br />
            2026-04-18,Eid
          </Typography>
          {lastResult ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Detected date column: <strong>{lastResult.detectedDateHeader}</strong>
                {lastResult.detectedNameHeader
                  ? ` · name column: ${lastResult.detectedNameHeader}`
                  : " · no name column"}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Created {lastResult.created}, updated {lastResult.updated}, unchanged{" "}
                {lastResult.unchanged}, skipped blank rows {lastResult.skipped}.
              </Typography>
              {lastResult.errors.length > 0 ? (
                <Table size="small" sx={{ mt: 1 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Issue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lastResult.errors.slice(0, 50).map((err, idx) => (
                      <TableRow key={`${err.rowNumber}-${idx}-${err.message}`}>
                        <TableCell>{err.rowNumber}</TableCell>
                        <TableCell>{err.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : null}
              {lastResult.errors.length > 50 ? (
                <Typography variant="caption" color="text.secondary">
                  Showing first 50 errors.
                </Typography>
              ) : null}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={busy}>
            Close
          </Button>
          <Button variant="contained" disabled={busy} onClick={() => inputRef.current?.click()}>
            Choose CSV file
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
