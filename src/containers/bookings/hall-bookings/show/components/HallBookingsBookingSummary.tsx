import { usePermissions, useRecordContext } from "react-admin";
import { Typography, Table, TableBody, TableCell, TableRow } from "@mui/material";
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";

import { useShowTotals } from "../BookingShowContext";
import { hasPermission } from "@/utils/permission-utils";

type AmountRow = { label: string; value: string | number; type?: string };

export const HallBookingsBookingSummary = () => {
  const record = useRecordContext();
  const { permissions } = usePermissions();
  const {
    depositAmount,
    rentAmount,
    thaalCount,
    thaalAmount,
    refundAmount,
    kitchenCleaningAmount,
    totalAmountPending,
  } = useShowTotals();

  if (!record) return null;

  const amountsLeft: AmountRow[] = [
    { label: "Deposit", value: depositAmount },
    { label: "Contribution", value: rentAmount },
    ...(kitchenCleaningAmount > 0
      ? [{ label: "Kitchen Cleaning", value: kitchenCleaningAmount }]
      : []),
    ...(thaalAmount > 0
      ? [
          {
            label: `Thaal (${thaalCount})`,
            value: thaalAmount || 0,
          },
        ]
      : []),
    ...((record.extraExpenses as number) > 0
      ? [{ label: "Extra Expenses", value: record.extraExpenses as number }]
      : []),
    ...((record.writeOffAmount as number) > 0
      ? [{ label: "Write Off", value: record.writeOffAmount as number }]
      : []),
    { label: "Total Payable", value: totalAmountPending },
  ];

  const amountsRight: AmountRow[] = [
    { label: "Deposit Paid", value: record.depositPaidAmount as number },
    { label: "Paid", value: record.paidAmount as number },
    { label: "Jamaat Lagat Paid", value: (record.jamaatLagat as number) || 0 },
    { label: "Refund", value: refundAmount },
    ...((record.refundReturnAmount as number) > 0
      ? [
          { label: "Refund Returned", value: record.refundReturnAmount as number },
          {
            label: "Refund Returned On",
            value: dayjs(record.refundReturnedOn as string).format("DD MMM YYYY"),
            type: "date",
          },
        ]
      : []),
  ];

  const LabelValue = ({ label, value }: { label: string; value: string | number }) => (
    <Typography component="div" sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <span>{label}:</span>
      <strong>{value}</strong>
    </Typography>
  );

  const labelValueConfig = [
    { label: "Organizer", value: record.organiser as string },
    { label: "ItsNo", value: record.itsNo as string },
    { label: "Phone", value: record.phone as string },
    { label: "Mohalla", value: record.mohalla as string },
    { label: "Sadarat", value: (record.sadarat as string) || "-" },
    { label: "PAN Card", value: (record.pancard as string) || "-" },
    { label: "Raza Granted", value: record.razaGranted ? "Yes" : "No" },
    {
      label: "Booked On",
      value: dayjs(record.createdAt as string).format("DD MMM YYYY"),
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid
        sx={{ borderRight: 1, borderRightColor: "divider", pr: 2 }}
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Table size="small" aria-label="summary" sx={{ borderTop: 1, borderTopColor: "divider" }}>
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
      {hasPermission(permissions, "bookings.edit") && (
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Payments
          </Typography>

          <Table
            size="small"
            aria-label="payments"
            sx={{ borderTop: 1, borderTopColor: "divider" }}
          >
            <TableBody>
              {amountsLeft.map((item, i) => (
                <TableRow key={item.label}>
                  <TableCell sx={{ borderRight: 1, borderRightColor: "divider" }}>
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
      )}
    </Grid>
  );
};

export default HallBookingsBookingSummary;
