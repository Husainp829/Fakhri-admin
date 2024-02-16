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
import { MARKAZ_LIST } from "../../constants";

const MarkazStats = ({ niyaazCounts }) => {
  const { currentEvent } = useContext(EventContext);

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Markaz</TableCell>
              <TableCell align="right">Registrations</TableCell>
              <TableCell align="right">Gents Count</TableCell>
              <TableCell align="right">Ladies Count</TableCell>
              <TableCell align="right">TakhmeenAmount</TableCell>
              <TableCell align="right">Chairs</TableCell>
              <TableCell align="right">Iftaari</TableCell>
              <TableCell align="right">Zabihats</TableCell>
              <TableCell align="right">Payable</TableCell>
              <TableCell align="right">Paid</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {niyaazCounts.map((row) => (
              <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell>
                  {MARKAZ_LIST.find((r) => r.value === row.markaz)?.displayVal || ""}
                </TableCell>
                <TableCell align="right">{row.count}</TableCell>
                <TableCell align="right">{row.gentsCount}</TableCell>
                <TableCell align="right">{row.ladiesCount}</TableCell>
                <TableCell align="right">
                  ₹ {Intl.NumberFormat("en-IN").format(row.takhmeenAmount)}
                </TableCell>
                <TableCell align="right">{row.chairs}</TableCell>
                <TableCell align="right">
                  ₹ {Intl.NumberFormat("en-IN").format(row.iftaari)}
                </TableCell>
                <TableCell align="right">{row.zabihat}</TableCell>
                <TableCell align="right">
                  ₹ {Intl.NumberFormat("en-IN").format(calcTotalPayable(currentEvent, row))}
                </TableCell>
                <TableCell align="right">
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
