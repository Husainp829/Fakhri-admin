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

const calcRowTotal = (row) => {
  const { CASH, CHEQUE, ONLINE } = row;
  const cash = Number(CASH || 0);
  const cheque = Number(CHEQUE || 0);
  const online = Number(ONLINE || 0);
  return Intl.NumberFormat("en-IN").format(cash + cheque + online);
};

const TotalRow = ({ values }) => {
  const { CASH, CHEQUE, ONLINE } = Object.values(values).reduce(
    (acc, value) => {
      const { CASH: cash, CHEQUE: cheque, ONLINE: online } = value;
      acc.CASH += Number(cash || 0);
      acc.CHEQUE += Number(cheque || 0);
      acc.ONLINE += Number(online || 0);
      return acc;
    },
    { CASH: 0, ONLINE: 0, CHEQUE: 0 }
  );

  return (
    <TableRow>
      <TableCell>TOTAL</TableCell>
      <TableCell align="center">₹ {Intl.NumberFormat("en-IN").format(Number(CASH || 0))}</TableCell>
      <TableCell align="center">
        ₹ {Intl.NumberFormat("en-IN").format(Number(CHEQUE || 0))}
      </TableCell>{" "}
      <TableCell align="center">
        ₹ {Intl.NumberFormat("en-IN").format(Number(ONLINE || 0))}
      </TableCell>
      <TableCell align="center">₹ {calcRowTotal({ CASH, CHEQUE, ONLINE })}</TableCell>
    </TableRow>
  );
};
const ReceiptDayWise = ({ receiptReport, selectedMarkaz }) => {
  const receiptMap = receiptGroupBy(receiptReport);
  if (!selectedMarkaz) {
    return null;
  }
  return (
    <>
      <Grid item lg={8} xs={12} sx={{ px: 1 }}>
        <TableContainer component={Paper} sx={{ mb: 5 }}>
          <Table sx={{ minWidth: 100 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>DAY</TableCell>
                <TableCell align="center">CASH</TableCell>
                <TableCell align="center">CHEQUE</TableCell>
                <TableCell align="center">ONLINE</TableCell>
                <TableCell align="center">TOTAL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(receiptMap?.[selectedMarkaz] || {}).map(([key, value]) => (
                <TableRow key={key} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>{key}</TableCell>
                  <TableCell align="center">
                    ₹ {Intl.NumberFormat("en-IN").format(Number(value.CASH || 0))}
                  </TableCell>
                  <TableCell align="center">
                    ₹ {Intl.NumberFormat("en-IN").format(Number(value.CHEQUE || 0))}
                  </TableCell>{" "}
                  <TableCell align="center">
                    ₹ {Intl.NumberFormat("en-IN").format(Number(value.ONLINE || 0))}
                  </TableCell>
                  <TableCell align="center">₹ {calcRowTotal(value)}</TableCell>
                </TableRow>
              ))}
              <TotalRow values={receiptMap?.[selectedMarkaz] || {}} />
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </>
  );
};

export default ReceiptDayWise;
