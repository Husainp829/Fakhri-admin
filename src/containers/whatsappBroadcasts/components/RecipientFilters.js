import React, { useState, useCallback, useRef } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Alert,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useFormContext, useWatch } from "react-hook-form";
import { useRecipientSelection } from "../context";
import AdvancedFilterBuilder from "./AdvancedFilterBuilder";
import { useLookupIts } from "./hooks";
import { parseBroadcastCsv, extractItsIdsFromParsedCsv, normalizeItsIdFromCell } from "./utils";

const CsvUploadTab = () => {
  const { setValue } = useFormContext();
  const { updateSelectedPhones, updatePreviewStatus } = useRecipientSelection();
  const { data: lookupData, isLoading, error, lookup, reset } = useLookupIts();

  const [parsedIds, setParsedIds] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [csvParseError, setCsvParseError] = useState(null);
  const fileInputRef = useRef(null);
  const parsedCsvRef = useRef(null);

  const handleFileUpload = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      setCsvParseError(null);
      parsedCsvRef.current = null;
      reset();
      updatePreviewStatus(false);
      setValue("recipientCsvData", null, { shouldDirty: false });
      setValue("csvColumnHeaders", [], { shouldDirty: false });

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text !== "string") return;

        const parsed = parseBroadcastCsv(text);
        parsedCsvRef.current = parsed;

        if (!parsed.headers.length || !parsed.rows.length) {
          setCsvParseError("No data rows found in the file.");
          setParsedIds([]);
          return;
        }

        if (!parsed.itsHeader) {
          setCsvParseError(
            "Could not find an ITS column. Add a header named ITS, ITS_ID, or itsNo, or use a single column of ITS numbers."
          );
          setParsedIds([]);
          return;
        }

        const unique = extractItsIdsFromParsedCsv(parsed);
        if (unique.length === 0) {
          setCsvParseError("No valid ITS numbers found in the ITS column.");
          setParsedIds([]);
          return;
        }

        setParsedIds(unique);
        lookup(unique);
      };
      reader.readAsText(file);

      // Reset the input so re-uploading the same file triggers onChange
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [lookup, reset, updatePreviewStatus, setValue]
  );

  // When lookup completes, sync matched recipients into the form/context
  React.useEffect(() => {
    if (!lookupData) return;

    const matched = lookupData.matched || [];
    if (matched.length > 0) {
      const recipients = matched
        .filter((r) => r.WhatsApp_No || r.Mobile)
        .map((r) => ({
          ITS_ID: r.ITS_ID || null,
          phone: String(r.WhatsApp_No || r.Mobile).trim(),
          Full_Name: r.Full_Name || null,
        }));

      updateSelectedPhones(recipients);
      updatePreviewStatus(true);

      // Store ITS IDs in form for submission
      setValue("recipientItsIds", matched.map((r) => r.ITS_ID).filter(Boolean), {
        shouldDirty: false,
      });

      const parsed = parsedCsvRef.current;
      if (parsed && parsed.itsHeader && parsed.rows.length) {
        const rowsByIts = {};
        parsed.rows.forEach((row) => {
          const id = normalizeItsIdFromCell(row[parsed.itsHeader]);
          if (id) {
            const flat = {};
            Object.keys(row).forEach((k) => {
              flat[k] = row[k] === undefined || row[k] === null ? "" : String(row[k]);
            });
            rowsByIts[id] = flat;
          }
        });

        const csvDataByItsId = {};
        matched.forEach((r) => {
          const id = r.ITS_ID !== undefined && r.ITS_ID !== null ? String(r.ITS_ID).trim() : "";
          if (id && rowsByIts[id]) {
            csvDataByItsId[id] = rowsByIts[id];
          }
        });

        setValue(
          "recipientCsvData",
          Object.keys(csvDataByItsId).length > 0 ? csvDataByItsId : null,
          { shouldDirty: false }
        );
        setValue("csvColumnHeaders", parsed.headers.slice(), {
          shouldDirty: false,
        });
      } else {
        setValue("recipientCsvData", null, { shouldDirty: false });
        setValue("csvColumnHeaders", [], { shouldDirty: false });
      }
    } else {
      updateSelectedPhones([]);
      updatePreviewStatus(false);
      setValue("recipientItsIds", null, { shouldDirty: false });
      setValue("recipientCsvData", null, { shouldDirty: false });
      setValue("csvColumnHeaders", [], { shouldDirty: false });
    }
  }, [lookupData, updateSelectedPhones, updatePreviewStatus, setValue]);

  const matched = lookupData?.matched || [];
  const unmatched = lookupData?.unmatched || [];
  const paginatedMatched = matched.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2, py: 0.75 }}>
        Upload a CSV with an ITS column (&ldquo;ITS&rdquo;, &ldquo;ITS_ID&rdquo;, or
        &ldquo;itsNo&rdquo;) or a single column of ITS numbers. Extra columns can be mapped to
        template parameters under Column → CSV file. All ITS numbers are checked against the
        database.
      </Alert>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
          Upload CSV
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            hidden
            onChange={handleFileUpload}
          />
        </Button>
        {fileName && (
          <Typography variant="body2" color="text.secondary">
            {fileName} — {parsedIds.length} ITS number
            {parsedIds.length !== 1 ? "s" : ""} parsed
          </Typography>
        )}
      </Stack>

      {isLoading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, my: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Looking up {parsedIds.length} ITS numbers…</Typography>
        </Box>
      )}

      {csvParseError && (
        <Alert severity="error" sx={{ my: 2 }}>
          {csvParseError}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error?.message || "Failed to look up ITS data"}
        </Alert>
      )}

      {lookupData && !isLoading && (
        <>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip label={`${matched.length} matched`} color="success" variant="outlined" />
            {unmatched.length > 0 && (
              <Chip label={`${unmatched.length} not found`} color="error" variant="outlined" />
            )}
          </Stack>

          {unmatched.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              The following ITS numbers were not found: <strong>{unmatched.join(", ")}</strong>
            </Alert>
          )}

          {matched.length > 0 && (
            <Card variant="outlined">
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ITS ID</TableCell>
                      <TableCell>Full Name</TableCell>
                      <TableCell>WhatsApp No</TableCell>
                      <TableCell>Sector</TableCell>
                      <TableCell>Sub Sector</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedMatched.map((r) => (
                      <TableRow key={r.id || r.ITS_ID}>
                        <TableCell>{r.ITS_ID || "-"}</TableCell>
                        <TableCell>{r.Full_Name || "-"}</TableCell>
                        <TableCell>{r.WhatsApp_No || r.Mobile || "-"}</TableCell>
                        <TableCell>{r.Sector || "-"}</TableCell>
                        <TableCell>{r.Sub_Sector || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={matched.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </Card>
          )}

          {matched.length > 0 && (
            <Alert severity="success" sx={{ mt: 2, py: 0.5 }}>
              <Typography variant="body2" component="span" fontWeight="bold">
                {matched.filter((r) => r.WhatsApp_No || r.Mobile).length}
              </Typography>{" "}
              recipients with phone numbers will receive the broadcast
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

const RecipientFilters = () => {
  const { setValue, control } = useFormContext();
  const { updateSelectedPhones, updatePreviewStatus } = useRecipientSelection();

  const filterCriteria = useWatch({ control, name: "filterCriteria" });
  const [tab, setTab] = useState(0);

  const handleTabChange = useCallback(
    (_, newTab) => {
      setTab(newTab);
      // Reset selection state when switching tabs
      updateSelectedPhones([]);
      updatePreviewStatus(false);
      setValue("recipientItsIds", null, { shouldDirty: false });
      setValue("recipientCsvData", null, { shouldDirty: false });
      setValue("csvColumnHeaders", [], { shouldDirty: false });
    },
    [updateSelectedPhones, updatePreviewStatus, setValue]
  );

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Advanced Filter" />
        <Tab label="Upload CSV (ITS Numbers)" />
      </Tabs>

      {tab === 0 && (
        <AdvancedFilterBuilder
          value={filterCriteria}
          onChange={(filterGroup) => {
            setValue("filterCriteria", filterGroup);
            updatePreviewStatus(false);
          }}
          onSelectionChange={updateSelectedPhones}
          onPreviewed={updatePreviewStatus}
        />
      )}

      {tab === 1 && <CsvUploadTab />}
    </Box>
  );
};

export default RecipientFilters;
