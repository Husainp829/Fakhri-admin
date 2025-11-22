import React, { useState } from "react";
import { useGetOne } from "react-admin";
import dayjs from "dayjs";
import { Box, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import { useParams } from "react-router";

import ReceiptHeader from "../../components/ReceiptLayout/receiptHeader";
import { fromGregorian } from "../../utils/hijriDateUtils";

const RazaPrint = () => {
  const { id } = useParams();
  const { data } = useGetOne("bookings", { id });

  // eslint-disable-next-line no-console
  console.log(data);

  const [error] = useState();

  if (error) return <Box p={3}>No Results Found</Box>;
  if (!data) return <Box p={3}>...Loading</Box>;

  const TableCellComp = ({ children }) => (
    <TableCell sx={{ fontFamily: "Roboto, sans-serif", fontSize: 16, textTransform: "capitalize" }}>
      {children}
    </TableCell>
  );

  return (
    <Box p={2} className="main-div" sx={{ fontFamily: "Roboto, sans-serif" }}>
      <ReceiptHeader title="ANJUMAN - E - FAKHRI" subTitle="Fakhri Mohalla Pune" />

      <Box borderTop="5px solid #ccc" p={2}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          ITS No. :
          <Box flex={3} borderBottom="1px solid #cfcfcf" mr={5} ml={1}>
            {data?.itsNo}
          </Box>
          <Box flex={3} borderBottom="1px solid #cfcfcf" textAlign="right" mr={1}>
            {dayjs(data.createdAt).format("DD/MM/YYYY")}
          </Box>
          : تاريخ
        </Box>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <>Mobile No :</>
          <Box flex={3} borderBottom="1px solid #cfcfcf" ml={1}>
            {data.phone}
          </Box>
        </Box>

        <Box textAlign="right" mb={2}>
          <>بعد التحيات جناب عامل صاحب</>
        </Box>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Box borderBottom="1px solid #cfcfcf" mr={2}>
            {data.organiser}
          </Box>
          <>: الاخ النجيب / الاخت النجيبه</>
        </Box>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <>ني رزا واسطے حاضر تھیا چھے</>
          <Box borderBottom="1px solid #cfcfcf" ml={2}>
            {data.purpose}
          </Box>
        </Box>

        <Box mt={3}>
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCellComp>Venue</TableCellComp>
                  <TableCellComp>Date</TableCellComp>
                  <TableCellComp>Day</TableCellComp>
                  <TableCellComp>Thaals</TableCellComp>
                  <TableCellComp>Time</TableCellComp>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.hallBookings.map((hall) => (
                  <TableRow key={hall.id}>
                    <TableCellComp>{hall.hall?.name}</TableCellComp>
                    <TableCellComp>
                      {dayjs(hall.date).format("DD MMM YYYY")} <br />
                      {fromGregorian(new Date(hall.date))}
                    </TableCellComp>
                    <TableCellComp>{dayjs(hall.date).format("dddd")}</TableCellComp>
                    <TableCellComp>{hall.thaals === 0 ? "تقسیم" : hall.thaals}</TableCellComp>
                    <TableCellComp>{hall.slot}</TableCellComp>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Box px={3} py={1} flex={1} display="flex" flexDirection="column">
            <Box display="flex">
              <>Mohalla :</>
              <Box flex={3} borderBottom="1px solid #cfcfcf" mr={3} pl={1}>
                {data.mohalla}
              </Box>
            </Box>
            <Box display="flex" py={3}>
              <>Sadarat :</>
              <Box flex={3} borderBottom="1px solid #cfcfcf" ml={2}>
                {data.sadarat}
              </Box>
            </Box>
            <Box mt={10} borderTop="1px solid #ccc" pt={2}>
              Jamaat Autho. Sign.
            </Box>
          </Box>

          <Box
            width={250}
            height={250}
            border="1px solid #afafaf"
            display="flex"
            alignItems="flex-end"
            justifyContent="center"
          >
            <>عامل صاحب</>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RazaPrint;
