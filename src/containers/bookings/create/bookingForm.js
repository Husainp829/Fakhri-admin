/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import { TextInput, ReferenceInput, NumberInput, SelectInput } from "react-admin";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button, Typography, Table, TableBody, TableCell, TableRow } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import ITSLookup from "../common/ITSLookup";
import HallBookingTable from "./bookingTable";
import HallBookingModal from "./bookingModal";
import { calcBookingTotals } from "../../../utils/bookingCalculations";

const LabelValue = ({ label, value, labelProps = {}, valueProps = {} }) => (
  <TableRow>
    <TableCell sx={{ width: "50%" }} />
    <TableCell component="th" scope="row" sx={{ paddingRight: 2 }}>
      <Typography variant="body1" color="text.secondary" {...labelProps}>
        {label}
      </Typography>
    </TableCell>
    <TableCell align="right">
      <Typography variant="body1" color="text.primary" {...valueProps}>
        ₹{value}
      </Typography>
    </TableCell>
  </TableRow>
);

export default function HallBookingForm() {
  const { control, setValue } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "hallBookings",
  });

  const [open, setOpen] = useState(false);

  const hallBookings = useWatch({ name: "hallBookings" });
  const rentAmount = useWatch({ name: "rentAmount" });
  const depositAmount = useWatch({ name: "depositAmount" });
  const thaalAmount = useWatch({ name: "thaalAmount" });

  const {
    rentAmount: rent,
    depositAmount: deposit,
    thaalCount,
    thaalAmount: thaals,
    totalAmountPending: totalPayable,
  } = calcBookingTotals({ halls: hallBookings });
  useEffect(() => {
    if (rentAmount !== rent) {
      setValue("rentAmount", rent);
    }
    if (depositAmount !== deposit) {
      setValue("depositAmount", deposit);
    }
    if (thaalAmount !== thaals) {
      setValue("thaalAmount", thaals);
    }
  }, [rent, deposit, thaals]);

  return (
    <Grid container spacing={1} sx={{ mt: 3 }}>
      <Grid item md={5} xs={12} sx={{ pr: 1, borderRight: "1px solid #efefef" }}>
        <ITSLookup />

        <TextInput source="organiser" label="Organiser" fullWidth isRequired sx={{ mt: 3 }} />

        <TextInput source="phone" label="Phone" fullWidth isRequired />

        <ReferenceInput source="purpose" reference="bookingPurpose">
          <SelectInput fullWidth sx={{ mt: 0 }} isRequired optionText="id" />
        </ReferenceInput>

        <TextInput source="mohalla" label="Mohalla" defaultValue="Fakhri Mohalla" fullWidth />
        <TextInput source="sadarat" label="Sadarat" fullWidth />
      </Grid>

      <Grid
        item
        md={7}
        xs={12}
        sx={{ pr: 1, mt: -1, borderLeft: "1px solid #efefef", textAlign: "right" }}
      >
        <Button variant="outlined" onClick={() => setOpen(true)} size="small">
          Add Hall
        </Button>

        <HallBookingTable fields={fields} remove={remove} />
        <Table size="small" sx={{ width: "100%", mt: 5 }}>
          <TableBody>
            <LabelValue label="Deposit" value={depositAmount || 0} />
            <LabelValue label="Rent" value={rentAmount || 0} />
            <LabelValue
              label={`Thaal (₹${thaalAmount / thaalCount} x ${thaalCount})`}
              value={thaalAmount || 0}
            />
            <LabelValue label="Total Payable" value={totalPayable} />
          </TableBody>
        </Table>

        <NumberInput
          label="Deposit Amount Paid"
          source="depositPaidAmount"
          fullWidth
          defaultValue={0}
          sx={{ mt: 4.8 }}
        />

        <NumberInput label="Rent Amount Paid" source="paidAmount" fullWidth defaultValue={0} />

        <HallBookingModal
          open={open}
          onClose={() => setOpen(false)}
          append={append}
          hallBookings={fields}
        />
      </Grid>
    </Grid>
  );
}
