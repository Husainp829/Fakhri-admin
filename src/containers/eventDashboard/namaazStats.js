import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/GridLegacy";

const NamaazStats = ({ namaazCounts, selectedMarkaz }) => (
  <Grid container spacing={1} sx={{ mt: 3 }}>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Registrations</TableCell>
            <TableCell align="center">Gents Count</TableCell>
            <TableCell align="center">Ladies Count</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {namaazCounts
            .filter((r) => r.namaazVenue === selectedMarkaz)
            .map((row) => (
              <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell align="center">{row.count}</TableCell>
                <TableCell align="center">{row.gentsCount}</TableCell>
                <TableCell align="center">{row.ladiesCount}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Grid>
);

export default NamaazStats;
