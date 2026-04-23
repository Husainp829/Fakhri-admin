import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useGetList } from "react-admin";
import { formatLongDate } from "@/utils/date-format";
import { slotNameMap } from "@/constants";
import { useShowTotals } from "../BookingShowContext";
import type { RaRecord } from "react-admin";

type ClosePayload = {
  extraExpenses: number;
  remarks: string;
  actualThaals: Record<string, number>;
};

export const HallBookingsCloseBookingModal = ({
  open,
  onClose,
  record,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  record: RaRecord;
  onSubmit: (data: ClosePayload) => void;
}) => {
  const [actualThaals, setActualThaals] = useState<Record<string, number>>({});
  const [extraExpenses, setExtraExpenses] = useState<string | number>(0);
  const [remarks, setRemarks] = useState("");
  const { data: hallBookings = [] } = useGetList(
    "hallBookings",
    { filter: { bookingId: record.id } },
    { enabled: open }
  );

  useEffect(() => {
    if (hallBookings.length > 0) {
      const initThaals: Record<string, number> = {};
      hallBookings.forEach((hall) => {
        initThaals[String(hall.id)] = (hall.thaals as number) || 0;
      });
      setActualThaals(initThaals);
    }
  }, [hallBookings]);

  const {
    rentAmount,
    thaalCount,
    thaalAmount,
    refundAmount: refund,
    totalAmountPending,
  } = useShowTotals();

  const jamaatLagat = Number(record.jamaatLagat) || 0;

  const breakdown = useMemo(
    () => ({
      rentAmount,
      jamaatLagat,
      thaalAmount,
      thaalCount,
      totalPending: totalAmountPending,
      refund,
    }),
    [rentAmount, jamaatLagat, thaalAmount, thaalCount, totalAmountPending, refund]
  );

  const handleThaalsChange = (hallId: string, value: string) => {
    setActualThaals((prev) => ({
      ...prev,
      [hallId]: parseInt(value || "0", 10),
    }));
  };

  const handleSubmit = () => {
    onSubmit({
      extraExpenses: Number(extraExpenses) || 0,
      remarks,
      actualThaals,
    });
    onClose();
  };

  const thaalDivisor = breakdown.thaalCount || 1;

  const breakdownRows = [
    {
      label: "Rent Amount",
      value: breakdown.rentAmount,
    },
    {
      label: "Jamaat Lagat",
      value: breakdown.jamaatLagat,
    },
    {
      label: `Thaal Amount (${breakdown.thaalCount} × ${breakdown.thaalAmount / thaalDivisor})`,
      value: breakdown.thaalAmount,
    },
    {
      label: "Total Pending",
      value: breakdown.totalPending,
    },
    {
      label: "Deposit Paid",
      value: record?.depositPaidAmount as number,
    },
    {
      label: "Amount Paid",
      value: record?.paidAmount as number,
    },
    {
      label: "Extra Expenses",
      value: extraExpenses,
    },
    ...((record?.writeOffAmount as number) > 0
      ? [
          {
            label: "Write Off Amount",
            value: record?.writeOffAmount as number,
          },
        ]
      : []),
    {
      label: "Final Refund",
      value: breakdown.refund,
      isBold: true,
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Close Event – Booking #{record?.bookingNo as string}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" gutterBottom mb={2}>
          Halls & Thaals
        </Typography>
        <Box sx={{ mb: 2 }}>
          {hallBookings.map((hall) => (
            <Grid container spacing={2} key={String(hall.id)} sx={{ mb: 1 }}>
              <Grid size={6}>
                <Typography>
                  {(hall.hall as { name?: string } | undefined)?.name}
                  <br />
                  {formatLongDate(hall.date as string)} - {slotNameMap[String(hall.slot)]}
                </Typography>
              </Grid>
              <Grid size={2}>
                <Typography>Booked: {hall.thaals as number}</Typography>
              </Grid>
              <Grid size={4}>
                <TextField
                  type="number"
                  label="Actual Thaals"
                  value={actualThaals[String(hall.id)] ?? ""}
                  onChange={(e) => handleThaalsChange(String(hall.id), e.target.value)}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
          ))}
        </Box>

        <Typography variant="h6" gutterBottom mb={2}>
          Miscellaneous
        </Typography>
        <TextField
          type="number"
          label="Extra Expenses"
          value={extraExpenses}
          onChange={(e) => setExtraExpenses(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          size="small"
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />

        <Typography variant="h6" gutterBottom mb={2}>
          Payment Breakdown
        </Typography>
        <Table size="small">
          <TableBody>
            {breakdownRows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.isBold ? <strong>{row.label}</strong> : row.label}</TableCell>
                <TableCell align="right">
                  {row.isBold ? (
                    <strong>{Number(row.value).toFixed(2)}</strong>
                  ) : (
                    Number(row.value).toFixed(2)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Close Event
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HallBookingsCloseBookingModal;
