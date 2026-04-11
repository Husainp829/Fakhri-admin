import { useEffect, useMemo, useState } from "react";
import { useNotify, useRecordContext } from "react-admin";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import { alpha, type Theme } from "@mui/material/styles";
import { getApiUrl } from "@/constants";
import httpClient from "@/dataprovider/http-client";

type MakhsoosMatchRow = {
  id: string | number;
  ITS_ID?: string;
  Full_Name?: string;
  Sector?: string;
  Sub_Sector?: string;
  Mobile?: string;
  Address?: string;
  hasAttendedOhbatMajlis?: boolean;
};

type MakhsoosSortField = "Full_Name" | "Sector" | "Sub_Sector";

function compareMakhsoosText(a: string | undefined, b: string | undefined, order: "asc" | "desc") {
  const va = (a ?? "").trim().toLocaleLowerCase();
  const vb = (b ?? "").trim().toLocaleLowerCase();
  const c = va.localeCompare(vb, undefined, { sensitivity: "base" });
  return order === "asc" ? c : -c;
}

function attendedHighlightStyle(theme: Theme, attended: boolean) {
  if (!attended) {
    return {};
  }
  return {
    bgcolor: alpha(theme.palette.info.main, theme.palette.mode === "dark" ? 0.18 : 0.1),
    boxShadow: `inset 4px 0 0 ${theme.palette.info.main}`,
  };
}

function isMakhsoosRowsPayload(json: unknown): json is { rows: unknown } {
  return typeof json === "object" && json !== null && "rows" in json;
}

function displayText(v: string | undefined, trim = true) {
  const s = trim ? v?.trim() : v;
  return s ? s : "—";
}

function MakhsoosRowCard({ r }: { r: MakhsoosMatchRow }) {
  const attended = Boolean(r.hasAttendedOhbatMajlis);
  return (
    <Box
      sx={(theme) => ({
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: 1.5,
        ...attendedHighlightStyle(theme, attended),
      })}
    >
      <Typography variant="body2" component="div" sx={{ wordBreak: "break-word" }}>
        <Box component="span" sx={{ color: "text.secondary", fontWeight: 600 }}>
          ITS:{" "}
        </Box>
        {displayText(r.ITS_ID, false)}
      </Typography>
      <Typography variant="body2" component="div" sx={{ mt: 0.75, wordBreak: "break-word" }}>
        <Box component="span" sx={{ color: "text.secondary", fontWeight: 600 }}>
          Name:{" "}
        </Box>
        {displayText(r.Full_Name)}
      </Typography>
      <Typography variant="body2" component="div" sx={{ mt: 0.75, wordBreak: "break-word" }}>
        <Box component="span" sx={{ color: "text.secondary", fontWeight: 600 }}>
          Sector:{" "}
        </Box>
        {displayText(r.Sector)}
      </Typography>
      <Typography variant="body2" component="div" sx={{ mt: 0.75, wordBreak: "break-word" }}>
        <Box component="span" sx={{ color: "text.secondary", fontWeight: 600 }}>
          Sub-sector:{" "}
        </Box>
        {displayText(r.Sub_Sector)}
      </Typography>
      <Typography variant="body2" component="div" sx={{ mt: 0.75, wordBreak: "break-word" }}>
        <Box component="span" sx={{ color: "text.secondary", fontWeight: 600 }}>
          Mobile:{" "}
        </Box>
        {displayText(r.Mobile)}
      </Typography>
      <Typography variant="body2" component="div" sx={{ mt: 0.75, wordBreak: "break-word" }}>
        <Box component="span" sx={{ color: "text.secondary", fontWeight: 600 }}>
          Address:{" "}
        </Box>
        {displayText(r.Address)}
      </Typography>
      {attended && (
        <Typography
          variant="caption"
          sx={{ mt: 1, display: "block", color: "info.main", fontWeight: 600 }}
        >
          Attended an ohbat majlis before
        </Typography>
      )}
    </Box>
  );
}

/**
 * Lists makhsoos-marked ITS rows whose itsdata matches the host on Sector OR Sub_Sector (API: makhsoos-matches).
 */
export function MakhsoosHostSectorTab() {
  const record = useRecordContext();
  const notify = useNotify();
  const isNarrow = useMediaQuery((theme) => theme.breakpoints.down("md"), { noSsr: true });
  const [rows, setRows] = useState<MakhsoosMatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<MakhsoosSortField>("Full_Name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        if (sortField === "Full_Name") {
          return compareMakhsoosText(a.Full_Name, b.Full_Name, sortOrder);
        }
        if (sortField === "Sector") {
          return compareMakhsoosText(a.Sector, b.Sector, sortOrder);
        }
        return compareMakhsoosText(a.Sub_Sector, b.Sub_Sector, sortOrder);
      }),
    [rows, sortField, sortOrder]
  );

  const handleSort = (field: MakhsoosSortField) => {
    if (field === sortField) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    const id = record?.id;
    if (!id) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    httpClient(`${getApiUrl()}/ohbatMajalis/${id}/makhsoos-matches`)
      .then(({ json }) => {
        if (!cancelled) {
          const raw = isMakhsoosRowsPayload(json) ? json.rows : [];
          setRows(Array.isArray(raw) ? (raw as MakhsoosMatchRow[]) : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          notify("Could not load makhsoos matches for host sector", { type: "error" });
          setRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [record?.id, notify]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (sortedRows.length === 0 && rows.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No makhsoos ITS records share the host&apos;s sector or sub-sector, or host ITS was not
        found in itsdata.
      </Typography>
    );
  }

  const legend = (
    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
      Rows with a blue tint have attended at least one ohbat majlis before (any date).
    </Typography>
  );

  const narrowSortBar = (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: "wrap" }}>
      <FormControl size="small" sx={{ minWidth: (theme) => theme.spacing(22) }}>
        <InputLabel id="makhsoos-sort-field-label">Sort by</InputLabel>
        <Select
          labelId="makhsoos-sort-field-label"
          label="Sort by"
          value={sortField}
          onChange={(e) => {
            setSortField(e.target.value as MakhsoosSortField);
            setSortOrder("asc");
          }}
        >
          <MenuItem value="Full_Name">Name</MenuItem>
          <MenuItem value="Sector">Sector</MenuItem>
          <MenuItem value="Sub_Sector">Sub-sector</MenuItem>
        </Select>
      </FormControl>
      <IconButton
        aria-label={sortOrder === "asc" ? "Switch to descending sort" : "Switch to ascending sort"}
        onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
        size="small"
        color="primary"
        edge="end"
      >
        <SwapVertIcon fontSize="small" />
      </IconButton>
    </Stack>
  );

  if (isNarrow) {
    return (
      <>
        {legend}
        {narrowSortBar}
        <Stack component="ul" spacing={1.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {sortedRows.map((r) => (
            <Box key={r.id} component="li">
              <MakhsoosRowCard r={r} />
            </Box>
          ))}
        </Stack>
      </>
    );
  }

  return (
    <>
      {legend}
      <TableContainer
        sx={{
          maxWidth: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table
          size="small"
          aria-label="Makhsoos matches by host sector"
          sx={{ tableLayout: "fixed", width: "100%", minWidth: 720 }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={(theme) => ({
                  width: theme.spacing(18),
                  maxWidth: theme.spacing(18),
                  whiteSpace: "nowrap",
                  verticalAlign: "bottom",
                })}
              >
                Attended before
              </TableCell>
              <TableCell
                sx={(theme) => ({
                  width: theme.spacing(16),
                  maxWidth: theme.spacing(20),
                  whiteSpace: "nowrap",
                  verticalAlign: "bottom",
                })}
              >
                ITS
              </TableCell>
              <TableCell sx={{ verticalAlign: "bottom" }}>
                <TableSortLabel
                  active={sortField === "Full_Name"}
                  direction={sortField === "Full_Name" ? sortOrder : "asc"}
                  onClick={() => handleSort("Full_Name")}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ verticalAlign: "bottom" }}>
                <TableSortLabel
                  active={sortField === "Sector"}
                  direction={sortField === "Sector" ? sortOrder : "asc"}
                  onClick={() => handleSort("Sector")}
                >
                  Sector
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ verticalAlign: "bottom" }}>
                <TableSortLabel
                  active={sortField === "Sub_Sector"}
                  direction={sortField === "Sub_Sector" ? sortOrder : "asc"}
                  onClick={() => handleSort("Sub_Sector")}
                >
                  Sub-sector
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={(theme) => ({
                  width: theme.spacing(14),
                  maxWidth: theme.spacing(18),
                  whiteSpace: "nowrap",
                  verticalAlign: "bottom",
                })}
              >
                Mobile
              </TableCell>
              <TableCell sx={{ width: "32%", verticalAlign: "bottom" }}>Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows.map((r) => {
              const attended = Boolean(r.hasAttendedOhbatMajlis);
              return (
                <TableRow key={r.id} sx={(theme) => attendedHighlightStyle(theme, attended)}>
                  <TableCell
                    sx={(theme) => ({
                      width: theme.spacing(18),
                      maxWidth: theme.spacing(18),
                      whiteSpace: "nowrap",
                      verticalAlign: "top",
                      color: attended ? "info.main" : "text.secondary",
                    })}
                  >
                    {attended ? "Yes" : "—"}
                  </TableCell>
                  <TableCell
                    sx={(theme) => ({
                      maxWidth: theme.spacing(20),
                      whiteSpace: "nowrap",
                      verticalAlign: "top",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    })}
                    title={r.ITS_ID?.trim() || undefined}
                  >
                    {displayText(r.ITS_ID, false)}
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      verticalAlign: "top",
                    }}
                  >
                    {displayText(r.Full_Name)}
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      verticalAlign: "top",
                    }}
                  >
                    {displayText(r.Sector)}
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      verticalAlign: "top",
                    }}
                  >
                    {displayText(r.Sub_Sector)}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap", verticalAlign: "top" }}>
                    {displayText(r.Mobile)}
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      verticalAlign: "top",
                    }}
                  >
                    {displayText(r.Address)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
