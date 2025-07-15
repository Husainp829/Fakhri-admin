/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import { TextInput, ReferenceInput, NumberInput } from "react-admin";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Grid, Button } from "@mui/material";
import ITSLookup from "../common/ITSLookup";
import HallBookingTable from "./bookingTable";
import HallBookingModal from "./bookingModal";
import { PurposeInput } from "../common/purposeInput";
import { calcBookingTotals } from "../../../utils";
import { PER_THAAL_COST } from "../../../constants";

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

  useEffect(() => {
    if (hallBookings?.length > 0) {
      const { rent, deposit, thaals } = calcBookingTotals(hallBookings);
      if (rentAmount !== rent) {
        setValue("rentAmount", rent);
      }
      if (depositAmount !== deposit) {
        setValue("depositAmount", deposit);
      }
      if (thaalAmount !== thaals * PER_THAAL_COST) {
        setValue("thaalAmount", thaals * PER_THAAL_COST);
      }
    }
  }, [hallBookings]);

  return (
    <Grid container spacing={1} sx={{ mt: 3 }}>
      <Grid item md={5} xs={12} sx={{ pr: 1, borderRight: "1px solid #efefef" }}>
        <ITSLookup />

        <TextInput source="organiser" label="Organiser" fullWidth isRequired sx={{ mt: 3 }} />

        <TextInput source="phone" label="Phone" fullWidth isRequired />

        <ReferenceInput source="purpose" reference="bookingPurpose">
          <PurposeInput fullWidth sx={{ mt: 0 }} isRequired optionText="id" />
        </ReferenceInput>

        <NumberInput label="Deposit" source="depositAmount" fullWidth disabled defaultValue={0} />

        <NumberInput label="Rent" source="rentAmount" fullWidth disabled defaultValue={0} />

        <NumberInput
          label="Sarkari Lagat"
          source="sarkariLagat"
          defaultValue={0}
          fullWidth
          disabled
        />

        <NumberInput
          label="Thaal Amount"
          source="thaalAmount"
          fullWidth
          disabled
          defaultValue={0}
        />

        <NumberInput
          label="Write Off Amount"
          source="writeOffAmount"
          fullWidth
          disabled
          defaultValue={0}
        />

        <NumberInput label="Paid Amount" source="paidAmount" fullWidth defaultValue={0} />

        <NumberInput
          label="Refund Amount"
          source="refundAmount"
          fullWidth
          disabled
          defaultValue={0}
        />
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
