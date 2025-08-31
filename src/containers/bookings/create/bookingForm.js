/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import { TextInput, ReferenceInput, NumberInput, RadioButtonGroupInput } from "react-admin";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button, Typography, Table, TableBody, TableCell, TableRow } from "@mui/material";
import Grid from "@mui/material/Grid";
import ITSLookup from "../common/ITSLookup";
import HallBookingTable from "./bookingTable";
import HallBookingModal from "./bookingModal";
import { calcBookingTotals } from "../../../utils/bookingCalculations";
import { PurposeInput } from "../common/purposeInput";

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
  const kitchenCleaningAmount = useWatch({ name: "kitchenCleaningAmount" });
  const depositAmount = useWatch({ name: "depositAmount" });
  const thaalAmount = useWatch({ name: "thaalAmount" });
  const jamaatLagat = useWatch({ name: "jamaatLagat" });
  const jamaatLagatUnit = useWatch({ name: "jamaatLagatUnit" });
  const perThaalCost = useWatch({ name: "perThaalCost" });
  const mohalla = useWatch({ name: "mohalla" });

  const mode = useWatch({ name: "mode" });

  const {
    rentAmount: rent,
    kitchenCleaningAmount: kc,
    jamaatLagat: lagat,
    depositAmount: deposit,
    thaalCount,
    thaalAmount: thaals,
    totalAmountPending: totalPayable,
  } = calcBookingTotals({
    halls: hallBookings,
    jamaatLagatUnit,
    perThaalCost,
    mohalla,
  });
  useEffect(() => {
    if (rentAmount !== rent) {
      setValue("rentAmount", rent);
    }
    if (kc !== kitchenCleaningAmount) {
      setValue("kitchenCleaningAmount", kc);
    }
    if (depositAmount !== deposit) {
      setValue("depositAmount", deposit);
    }
    if (thaalAmount !== thaals) {
      setValue("thaalAmount", thaals);
    }
    if (jamaatLagat !== lagat) {
      setValue("jamaatLagat", lagat);
    }
  }, [rent, deposit, thaals]);

  return (
    <Grid container spacing={1} sx={{ mt: 3 }}>
      <Grid item size={{ md: 5, xs: 12 }} sx={{ pr: 1, borderRight: "1px solid #efefef" }}>
        <ITSLookup />

        <TextInput source="organiser" label="Organiser" fullWidth isRequired sx={{ mt: 3 }} />

        <TextInput source="phone" label="Phone" fullWidth isRequired />

        <ReferenceInput source="purpose" reference="bookingPurpose">
          <PurposeInput label="Purpose" optionText="name" debounce={300} fullWidth required />
        </ReferenceInput>

        <TextInput source="mohalla" label="Mohalla" defaultValue="Fakhri Mohalla" fullWidth />
        <TextInput source="sadarat" label="Sadarat" fullWidth />
      </Grid>

      <Grid item size={{ md: 7, xs: 12 }} sx={{ pr: 1, mt: -1, textAlign: "right" }}>
        <Button variant="outlined" onClick={() => setOpen(true)} size="small">
          Add Hall
        </Button>

        <HallBookingTable fields={fields} remove={remove} />
        <Table size="small" sx={{ width: "100%", mt: 5 }}>
          <TableBody>
            <LabelValue label="Deposit" value={depositAmount || 0} />
            <LabelValue label="Rent" value={rentAmount || 0} />
            {thaalAmount > 0 && (
              <LabelValue label={`Thaal (${thaalCount})`} value={thaalAmount || 0} />
            )}

            {kitchenCleaningAmount > 0 && (
              <LabelValue label="Kitchen Cleaning" value={kitchenCleaningAmount || 0} />
            )}

            <LabelValue label="Jamaat Lagat" value={jamaatLagat || 0} />
            <LabelValue label="Total Payable" value={totalPayable} />
          </TableBody>
        </Table>

        <NumberInput
          label="Deposit Amount Paid"
          source="depositPaidAmount"
          fullWidth
          defaultValue={0}
          sx={{ mt: 4.8 }}
          helperText="Accept Deposit Amount In Cash Only"
        />

        <NumberInput label="Rent Amount Paid" source="paidAmount" fullWidth defaultValue={0} />

        <RadioButtonGroupInput
          source="mode"
          choices={[
            { id: "CASH", name: "CASH" },
            { id: "ONLINE", name: "ONLINE" },
            { id: "CHEQUE", name: "CHEQUE" },
          ]}
          sx={{ textAlign: "left" }}
        />
        {mode && mode !== "CASH" && (
          <TextInput source="ref" label="Reference" fullWidth multiline />
        )}

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
