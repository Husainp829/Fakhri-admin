/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useContext } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { calcTotalPayable } from "../../utils";

import { EventContext } from "../../dataprovider/eventProvider";

const MarkazStats = ({ niyaazCounts, selectedMarkaz }) => {
  const { currentEvent } = useContext(EventContext);

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Registrations</TableCell>
              <TableCell align="center">Gents Count</TableCell>
              <TableCell align="center">Ladies Count</TableCell>
              <TableCell align="center">TakhmeenAmount</TableCell>
              <TableCell align="center">Chairs</TableCell>
              <TableCell align="center">Iftaari</TableCell>
              <TableCell align="center">Zabihats</TableCell>
              <TableCell align="center">Payable</TableCell>
              <TableCell align="center">Paid</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {niyaazCounts
              .filter((r) => r.markaz === selectedMarkaz)
              .map((row) => (
                <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell align="center">{row.count}</TableCell>
                  <TableCell align="center">{row.gentsCount}</TableCell>
                  <TableCell align="center">{row.ladiesCount}</TableCell>
                  <TableCell align="center">
                    ₹ {Intl.NumberFormat("en-IN").format(row.takhmeenAmount)}
                  </TableCell>
                  <TableCell align="center">{row.chairs}</TableCell>
                  <TableCell align="center">
                    ₹ {Intl.NumberFormat("en-IN").format(row.iftaari)}
                  </TableCell>
                  <TableCell align="center">{row.zabihat}</TableCell>
                  <TableCell align="center">
                    ₹ {Intl.NumberFormat("en-IN").format(calcTotalPayable(currentEvent, row))}
                  </TableCell>
                  <TableCell align="center">
                    ₹ {Intl.NumberFormat("en-IN").format(row.paidAmount)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default MarkazStats;
