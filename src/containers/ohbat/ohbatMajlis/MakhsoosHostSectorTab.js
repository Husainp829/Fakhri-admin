import React, { useEffect, useState } from "react";
import { useNotify, useRecordContext } from "react-admin";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { getApiUrl } from "../../../constants";
import httpClient from "../../../dataprovider/httpClient";

/**
 * Lists makhsoos-marked ITS rows whose itsdata matches the host on Sector OR Sub_Sector (API: makhsoos-matches).
 */
export default function MakhsoosHostSectorTab() {
  const record = useRecordContext();
  const notify = useNotify();
  const [rows, setRows] = useState([]);
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
          setRows(Array.isArray(json?.rows) ? json.rows : []);
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
        No makhsoos ITS records share the host&apos;s sector or sub-sector, or host ITS was not found in
        itsdata.
      </Typography>
    );
  }

  return (
    <TableContainer sx={{ maxWidth: "100%" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ITS</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Sector</TableCell>
            <TableCell>Sub-sector</TableCell>
            <TableCell>Mobile</TableCell>
            <TableCell>Address</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.ITS_ID ?? "—"}</TableCell>
              <TableCell>{r.Full_Name?.trim() || "—"}</TableCell>
              <TableCell sx={{ maxWidth: 220, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {r.Sector?.trim() || "—"}
              </TableCell>
              <TableCell sx={{ maxWidth: 220, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {r.Sub_Sector?.trim() || "—"}
              </TableCell>
              <TableCell>{r.Mobile?.trim() || "—"}</TableCell>
              <TableCell sx={{ maxWidth: 360, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {r.Address?.trim() || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
