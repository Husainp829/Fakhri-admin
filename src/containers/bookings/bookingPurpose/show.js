import React from "react";
import { Show, SimpleShowLayout, TextField, Title, useShowContext } from "react-admin";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";

const HallChargesTable = () => {
  const { record } = useShowContext();
  const hallCharges = record?.hallCharges || [];

  if (hallCharges.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        No hall charges configured for this purpose.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Hall</TableCell>
            <TableCell align="right">Rent</TableCell>
            <TableCell align="right">Deposit</TableCell>
            <TableCell align="right">AC Charges</TableCell>
            <TableCell align="right">Kitchen Cleaning</TableCell>
            <TableCell align="center">Include Thaal Charges</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hallCharges.map((charge, index) => (
            <TableRow key={charge.hallId || index}>
              <TableCell>{charge.hallName || charge.hallShortCode || charge.hallId}</TableCell>
              <TableCell align="right">
                {charge.rent ? `₹${charge.rent.toLocaleString()}` : "-"}
              </TableCell>
              <TableCell align="right">
                {charge.deposit ? `₹${charge.deposit.toLocaleString()}` : "-"}
              </TableCell>
              <TableCell align="right">
                {charge.acCharges ? `₹${charge.acCharges.toLocaleString()}` : "-"}
              </TableCell>
              <TableCell align="right">
                {charge.kitchenCleaning ? `₹${charge.kitchenCleaning.toLocaleString()}` : "-"}
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={charge.includeThaalCharges ? "Yes" : "No"}
                  color={charge.includeThaalCharges ? "success" : "default"}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const BookingPurposeShow = () => (
  <Show>
    <SimpleShowLayout>
      <Title title="Booking Purpose Details" />
      <TextField source="name" label="Name" />
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Hall Charges
        </Typography>
        <HallChargesTable />
      </Box>
    </SimpleShowLayout>
  </Show>
);

export default BookingPurposeShow;
