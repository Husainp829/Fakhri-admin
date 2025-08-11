/* eslint-disable no-console */
import React, { useState, useMemo, useEffect } from "react";
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
import Grid from "@mui/material/GridLegacy";
import { useGetList } from "react-admin";
import dayjs from "dayjs";
import { calcBookingTotals } from "../../../../utils/bookingCalculations";
import { slotNameMap } from "../../../../constants";

const CloseBookingModal = ({ open, onClose, record, onSubmit }) => {
  const [actualThaals, setActualThaals] = useState({});
  const [extraExpenses, setExtraExpenses] = useState(0);
  const [comments, setComments] = useState("");
  const { data: hallBookings = [] } = useGetList(
    "hallBookings",
    { filter: { bookingId: record.id } },
    { enabled: open }
  );

  // Initialize actual thaals from booked values
  useEffect(() => {
    if (hallBookings.length > 0) {
      const initThaals = {};
      hallBookings.forEach((hall) => {
        initThaals[hall.id] = hall.thaals || 0;
      });
      setActualThaals(initThaals);
    }
  }, [hallBookings]);

  // Calculations
  const breakdown = useMemo(() => {
    const {
      thaalAmount,
      thaalCount,
      refundAmount: refund,
      totalAmountPending,
      rentAmount,
    } = calcBookingTotals({
      halls: hallBookings.map((h) => ({ ...h, thaals: actualThaals[h.id] })),
      ...record,
      extraExpenses: Number(extraExpenses) || 0,
    });

    return {
      rentAmount,
      thaalAmount,
      thaalCount,
      totalPending: totalAmountPending,
      refund,
    };
  }, [actualThaals, extraExpenses, record]);

  const handleThaalsChange = (hallId, value) => {
    setActualThaals((prev) => ({
      ...prev,
      [hallId]: parseInt(value || "0", 10),
    }));
  };

  const handleSubmit = () => {
    onSubmit({
      extraExpenses: Number(extraExpenses) || 0,
      comments,
      actualThaals,
    });
    onClose();
  };

  const breakdownRows = [
    {
      label: "Rent Amount",
      value: breakdown.rentAmount,
    },
    {
      label: `Thaal Amount (${breakdown.thaalCount} × ${
        breakdown.thaalAmount / breakdown.thaalCount
      })`,
      value: breakdown.thaalAmount,
    },
    {
      label: "Total Pending",
      value: breakdown.totalPending,
    },
    {
      label: "Deposit Paid",
      value: record?.depositPaidAmount,
    },
    {
      label: "Amount Paid",
      value: record?.paidAmount,
    },
    {
      label: "Extra Expenses",
      value: extraExpenses,
    },
    ...(record?.writeOffAmount > 0
      ? [
          {
            label: "Write Off Amount",
            value: record?.writeOffAmount,
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
      <DialogTitle>Close Event – Booking #{record?.bookingNo}</DialogTitle>
      <DialogContent dividers>
        {/* Hall bookings list */}
        <Typography variant="h6" gutterBottom mb={2}>
          Halls & Thaals
        </Typography>
        <Box sx={{ mb: 2 }}>
          {hallBookings.map((hall) => (
            <Grid container spacing={2} key={hall.id} sx={{ mb: 1 }}>
              <Grid item xs={6}>
                <Typography>
                  {hall.hall?.name}
                  <br />
                  {dayjs(hall.date).format("DD MMM YYYY")} - {slotNameMap[hall.slot]}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>Booked: {hall.thaals}</Typography>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  type="number"
                  label="Actual Thaals"
                  value={actualThaals[hall.id] || ""}
                  onChange={(e) => handleThaalsChange(hall.id, e.target.value)}
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
        {/* Extra Expenses */}
        <TextField
          type="number"
          label="Extra Expenses"
          value={extraExpenses}
          onChange={(e) => setExtraExpenses(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* Comments */}
        <TextField
          label="Comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          size="small"
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />

        {/* Breakdown */}
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

export default CloseBookingModal;
