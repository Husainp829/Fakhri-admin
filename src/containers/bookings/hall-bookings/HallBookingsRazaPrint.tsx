import { useGetOne } from "react-admin";
import dayjs from "dayjs";
import { Box, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import { useParams } from "react-router";

import ReceiptHeader from "@/components/receipt-layout/ReceiptHeader";
import { useHardcopyBorders } from "@/theme/useHardcopyBorders";
import { fromGregorian } from "@/utils/hijri-date-utils";
import type { RaRecord } from "react-admin";

const RazaPrint = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useGetOne("bookings", { id: id ?? "" });
  const { solid1Soft, solid5, solid1 } = useHardcopyBorders();

  if (!data) return <Box p={3}>...Loading</Box>;

  const booking = data as RaRecord & {
    itsNo?: string;
    createdAt?: string;
    phone?: string;
    organiser?: string;
    purpose?: string;
    mohalla?: string;
    sadarat?: string;
    hallBookings?: {
      id: string;
      date?: string;
      thaals?: number;
      slot?: string;
      hall?: { name?: string };
    }[];
  };

  const TableCellComp = ({ children }: { children: React.ReactNode }) => (
    <TableCell sx={{ fontFamily: "Roboto, sans-serif", fontSize: 16, textTransform: "capitalize" }}>
      {children}
    </TableCell>
  );

  return (
    <Box p={2} className="main-div" sx={{ fontFamily: "Roboto, sans-serif" }}>
      <ReceiptHeader title="ANJUMAN - E - FAKHRI" subTitle="Fakhri Mohalla Pune" />

      <Box sx={{ borderTop: solid5, p: 2 }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          ITS No. :
          <Box flex={3} sx={{ borderBottom: solid1Soft, mr: 5, ml: 1 }}>
            {booking?.itsNo}
          </Box>
          <Box flex={3} sx={{ borderBottom: solid1Soft, textAlign: "right", mr: 1 }}>
            {booking.createdAt ? dayjs(booking.createdAt).format("DD/MM/YYYY") : ""}
          </Box>
          : تاريخ
        </Box>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <>Mobile No :</>
          <Box flex={3} sx={{ borderBottom: solid1Soft, ml: 1 }}>
            {booking.phone}
          </Box>
        </Box>

        <Box textAlign="right" mb={2}>
          <>بعد التحيات جناب عامل صاحب</>
        </Box>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Box sx={{ borderBottom: solid1Soft, mr: 2 }}>{booking.organiser}</Box>
          <>: الاخ النجيب / الاخت النجيبه</>
        </Box>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <>ني رزا واسطے حاضر تھیا چھے</>
          <Box sx={{ borderBottom: solid1Soft, ml: 2 }}>{booking.purpose}</Box>
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
                {(booking.hallBookings ?? []).map((hall) => (
                  <TableRow key={hall.id}>
                    <TableCellComp>{hall.hall?.name}</TableCellComp>
                    <TableCellComp>
                      {hall.date ? dayjs(hall.date).format("DD MMM YYYY") : ""} <br />
                      {hall.date ? fromGregorian(new Date(hall.date)) : ""}
                    </TableCellComp>
                    <TableCellComp>
                      {hall.date ? dayjs(hall.date).format("dddd") : ""}
                    </TableCellComp>
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
              <Box flex={3} sx={{ borderBottom: solid1Soft, mr: 3, pl: 1 }}>
                {booking.mohalla}
              </Box>
            </Box>
            <Box display="flex" py={3}>
              <>Sadarat :</>
              <Box flex={3} sx={{ borderBottom: solid1Soft, ml: 2 }}>
                {booking.sadarat}
              </Box>
            </Box>
            <Box mt={10} sx={{ borderTop: solid1, pt: 2 }}>
              Jamaat Autho. Sign.
            </Box>
          </Box>

          <Box
            width={250}
            height={250}
            sx={{ border: solid1 }}
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
