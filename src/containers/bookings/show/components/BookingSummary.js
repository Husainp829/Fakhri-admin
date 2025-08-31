/* eslint-disable no-console */
import React from "react";
import { useRecordContext } from "react-admin";
import { Typography, Table, TableBody, TableCell, TableRow } from "@mui/material";
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";
import { calcBookingTotals } from "../../../../utils/bookingCalculations";

const BookingSummary = () => {
  const record = useRecordContext();

  if (!record) return null;

  const {
    depositAmount,
    rentAmount,
    jamaatLagat,
    thaalCount,
    thaalAmount,
    refundAmount,
    kitchenCleaningAmount,
    totalAmountPending,
  } = calcBookingTotals({
    halls: (record.hallBookings || []).map((h) => ({ ...h, ...h.hall })),
    ...record,
    jamaatLagatUnit: record.bookingPurpose?.jamaatLagat || 0,
    perThaalCost: record.bookingPurpose?.perThaal,
    mohalla: record.mohalla,
  });

  // Group amounts separately for columns
  const amountsLeft = [
    { label: "Deposit", value: depositAmount },
    { label: "Contribution", value: rentAmount },
    ...(kitchenCleaningAmount > 0
      ? [{ label: "Kitchen Cleaning", value: kitchenCleaningAmount }]
      : []),
    { label: "Jamaat Lagat", value: jamaatLagat },
    ...(thaalAmount > 0
      ? [
          {
            label: `Thaal (${thaalCount})`,
            value: thaalAmount || 0,
          },
        ]
      : []),
    ...(record.extraExpenses > 0 ? [{ label: "Extra Expenses", value: record.extraExpenses }] : []),
    ...(record.writeOffAmount > 0 ? [{ label: "Write Off", value: record.writeOffAmount }] : []),
    { label: "Total Payable", value: totalAmountPending },
  ];

  const amountsRight = [
    { label: "Deposit Paid", value: record.depositPaidAmount },
    { label: "Paid", value: record.paidAmount },
    { label: "Refund", value: refundAmount },
    ...(record.refundReturnAmount > 0
      ? [
          { label: "Refund Returned", value: record.refundReturnAmount },
          {
            label: "Refund Returned On",
            value: dayjs(record.refundReturnedOn).format("DD MMM YYYY"),
            type: "date",
          },
        ]
      : []),
  ];

  const LabelValue = ({ label, value }) => (
    <Typography component="div" sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <span>{label}:</span>
      <strong>{value}</strong>
    </Typography>
  );

  const labelValueConfig = [
    { label: "Organizer", value: record.organiser },
    { label: "Phone", value: record.phone },
    { label: "Purpose", value: record.purpose },
    { label: "Mohalla", value: record.mohalla },
    { label: "Sadarat", value: record.sadarat || "-" },
    { label: "Raza Granted", value: record.razaGranted ? "Yes" : "No" },
    { label: "Booked On", value: dayjs(record.createdAt).format("DD MMM YYYY") },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item size={{ xs: 12, md: 6 }} borderRight="1px solid #efefef" pr={2}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Table size="small" aria-label="summary" sx={{ borderTop: "1px solid #efefef" }}>
          <TableBody>
            {labelValueConfig.map(({ label, value }) => (
              <TableRow key={label}>
                <TableCell>
                  <LabelValue label={label} value={value} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>

      <Grid item size={{ xs: 12, md: 6 }}>
        <Typography variant="h6" gutterBottom>
          Payments
        </Typography>

        <Table size="small" aria-label="payments" sx={{ borderTop: "1px solid #efefef" }}>
          <TableBody>
            {amountsLeft.map((item, i) => (
              <TableRow key={item.label}>
                <TableCell sx={{ borderRight: "1px solid #efefef" }}>
                  <LabelValue label={item.label} value={`₹${item.value ?? "0.00"}`} />
                </TableCell>
                <TableCell>
                  {amountsRight[i] ? (
                    <LabelValue
                      label={amountsRight[i].label}
                      value={`${!amountsRight[i].type ? "₹" : ""}${
                        amountsRight[i].value ?? "0.00"
                      }`}
                    />
                  ) : (
                    ""
                  )}
                </TableCell>
              </TableRow>
            ))}

            {/* If amountsRight has more items than amountsLeft, show those too */}
            {amountsRight.length > amountsLeft.length &&
              amountsRight.slice(amountsLeft.length).map((item) => (
                <TableRow key={item.label}>
                  <TableCell></TableCell>
                  <TableCell>
                    <LabelValue label={item.label} value={`₹${item.value ?? "0.00"}`} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};

export default BookingSummary;
