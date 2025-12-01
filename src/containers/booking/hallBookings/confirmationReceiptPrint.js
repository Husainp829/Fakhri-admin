import React, { useState } from "react";
import { useGetOne } from "react-admin";
import dayjs from "dayjs";
import { Box, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import { useParams } from "react-router";

import ReceiptHeader from "../../../components/ReceiptLayout/receiptHeader";
import { slotTimeRanges } from "../../../constants";

const ConfirmationVoucher = () => {
  const { id } = useParams();
  const { data } = useGetOne("bookings", { id });

  const [error] = useState();

  if (error) return <Box p={3}>No Results Found</Box>;
  if (!data) return <Box p={3}>...Loading</Box>;

  const TableCellComp = ({ children, ...rest }) => (
    <TableCell
      sx={{
        fontFamily: "Roboto, sans-serif",
        fontSize: 16,
        textTransform: "capitalize",
        ...rest,
      }}
    >
      {children}
    </TableCell>
  );

  return (
    <Box p={2} className="main-div" sx={{ fontFamily: "Roboto, sans-serif" }}>
      <ReceiptHeader title="ANJUMAN - E - FAKHRI" subTitle="Confirmation Voucher / Checkout Slip" />

      <Box borderTop="5px solid #ccc" p={2}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          Organiser :
          <Box flex={5} borderBottom="1px solid #cfcfcf" mr={5} ml={1}>
            {data.organiser}
          </Box>
          ITS No. :
          <Box flex={1} borderBottom="1px solid #cfcfcf" ml={1}>
            {/* {dayjs(data.createdAt).format("DD/MM/YYYY")} */}
            {data.itsNo}
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <>Mobile No :</>
          <Box flex={3} borderBottom="1px solid #cfcfcf" ml={1}>
            {data.phone}
          </Box>
          Purpose :
          <Box flex={3} borderBottom="1px solid #cfcfcf" ml={1}>
            {/* {dayjs(data.createdAt).format("DD/MM/YYYY")} */}
            {data.purpose}
          </Box>
        </Box>

        <Box mt={3}>
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCellComp>Venue</TableCellComp>
                  <TableCellComp>Thaal (Booked)</TableCellComp>
                  <TableCellComp>Thaal (Actual)</TableCellComp>
                  <TableCellComp>Checkout Time</TableCellComp>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.hallBookings.map((hall) => (
                  <TableRow key={hall.id}>
                    <TableCellComp>
                      {hall.hall?.name}
                      <br />
                      {`${dayjs(hall.date).format("DD/MMM/YYYY")} - ${dayjs()
                        .hour(slotTimeRanges[hall.slot][0])
                        .format("ha")} - ${dayjs()
                        .hour(slotTimeRanges[hall.slot][1])
                        .format("ha")}`}
                      <br />
                      <b>{hall.withAC ? "With AC" : "W/O AC"}</b>
                    </TableCellComp>

                    <TableCellComp>{hall.thaals === 0 ? "تقسیم" : hall.thaals}</TableCellComp>
                    <TableCellComp borderLeft="2px solid rgba(224, 224, 224, 1)"></TableCellComp>
                    <TableCellComp borderLeft="2px solid rgba(224, 224, 224, 1)"></TableCellComp>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>

        <Box display="flex" justifyContent="space-between" my={2}>
          No. Of Halogen:
          <Box flex={3} borderBottom="1px solid #cfcfcf" mr={5} ml={1} />
          No. Of Photo Lights:
          <Box flex={3} borderBottom="1px solid #cfcfcf" ml={1} />
        </Box>

        <Box display="flex" justifyContent="space-between" my={2}>
          Comments:
          <Box flex={3} borderBottom="1px solid #cfcfcf" ml={1} />
        </Box>
        <Box flex={1} borderBottom="1px solid #cfcfcf" sx={{ py: 1 }} />
        <Box flex={1} borderBottom="1px solid #cfcfcf" sx={{ py: 2 }} />
        <Box flex={1} borderBottom="1px solid #cfcfcf" sx={{ py: 2 }} />
        <Box display="flex" justifyContent="space-between" my={2}>
          Expenses Incurred (if any):
          <Box flex={3} borderBottom="1px solid #cfcfcf" ml={1} />
        </Box>

        <Box display="flex" justifyContent="space-between" mt={5}>
          Signatures
        </Box>

        <Box display="flex" justifyContent="space-between" my={2}>
          Host:
          <Box flex={3} borderBottom="1px solid #cfcfcf" mr={5} ml={1} />
          Manager:
          <Box flex={3} borderBottom="1px solid #cfcfcf" ml={1} />
        </Box>
        <Box display="flex" justifyContent="space-between" my={2}>
          Date:
          <Box flex={3} borderBottom="1px solid #cfcfcf" mr={5} ml={1} />
          Place:
          <Box flex={3} borderBottom="1px solid #cfcfcf" ml={1} />
        </Box>

        <Box flex={1} borderBottom="1px solid #cfcfcf" sx={{ py: 1 }} />

        <Box display="flex" justifyContent="space-between" my={2} mt={4}>
          Refund Amount:
          <Box flex={3} borderBottom="1px solid #cfcfcf" mr={5} ml={1} />
          Refund Received:
          <Box flex={3} borderBottom="1px solid #cfcfcf" ml={1} />
        </Box>
        <Box display="flex" justifyContent="space-between" my={2}>
          Refund Date:
          <Box flex={3} borderBottom="1px solid #cfcfcf" mr={5} ml={1} />
        </Box>
      </Box>
    </Box>
  );
};

export default ConfirmationVoucher;
