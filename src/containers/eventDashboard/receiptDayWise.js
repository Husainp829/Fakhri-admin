/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { receiptGroupBy } from "../../utils";
import { MARKAZ_LIST } from "../../constants";

const ReceiptDayWise = ({ receiptReport }) => {
  const receiptMap = receiptGroupBy(receiptReport);

  return (
    <>
      {Object.keys(receiptMap).map((markaz, i) => (
        <Grid item lg={6} xs={12} sx={{ px: 1 }} key={i}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {MARKAZ_LIST.find((m) => m.value === markaz)?.displayVal || ""}
          </Typography>
          <TableContainer component={Paper} key={i} sx={{ mb: 5 }}>
            <Table sx={{ minWidth: 100 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>DAY</TableCell>
                  <TableCell align="right">CASH</TableCell>
                  <TableCell align="right">ONLINE</TableCell>
                  <TableCell align="right">CHEQUE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(receiptMap[markaz]).map(([key, value]) => (
                  <TableRow key={key} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>{key}</TableCell>
                    <TableCell align="right">
                      ₹ {Intl.NumberFormat("en-IN").format(Number(value.CASH || 0))}
                    </TableCell>
                    <TableCell align="right">
                      ₹ {Intl.NumberFormat("en-IN").format(Number(value.CHEQUE || 0))}
                    </TableCell>{" "}
                    <TableCell align="right">
                      ₹ {Intl.NumberFormat("en-IN").format(Number(value.ONLINE || 0))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      ))}
    </>
  );
};

export default ReceiptDayWise;
