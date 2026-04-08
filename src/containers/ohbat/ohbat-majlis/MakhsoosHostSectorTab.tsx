import { useEffect, useState } from "react";
import { useNotify, useRecordContext } from "react-admin";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
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

  if (rows.length === 0) {
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

  if (isNarrow) {
    return (
      <>
        {legend}
        <Stack component="ul" spacing={1.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {rows.map((r) => (
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
        <Table size="small" aria-label="Makhsoos matches by host sector" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 1, whiteSpace: "nowrap" }}>Attended before</TableCell>
              <TableCell>ITS</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Sector</TableCell>
              <TableCell>Sub-sector</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => {
              const attended = Boolean(r.hasAttendedOhbatMajlis);
              return (
                <TableRow key={r.id} sx={(theme) => attendedHighlightStyle(theme, attended)}>
                  <TableCell
                    sx={{ whiteSpace: "nowrap", color: attended ? "info.main" : "text.secondary" }}
                  >
                    {attended ? "Yes" : "—"}
                  </TableCell>
                  <TableCell>{displayText(r.ITS_ID, false)}</TableCell>
                  <TableCell
                    sx={{ maxWidth: 200, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {displayText(r.Full_Name)}
                  </TableCell>
                  <TableCell
                    sx={{ maxWidth: 220, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {displayText(r.Sector)}
                  </TableCell>
                  <TableCell
                    sx={{ maxWidth: 220, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {displayText(r.Sub_Sector)}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{displayText(r.Mobile)}</TableCell>
                  <TableCell
                    sx={{ maxWidth: 360, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
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
