/* eslint-disable no-console */
import React, { useEffect, useMemo } from "react";
import {
  TextInput,
  NumberInput,
  RadioButtonGroupInput,
  useNotify,
  minValue,
  maxValue,
  required,
} from "react-admin";
import Grid from "@mui/material/Grid";
import { useWatch, useFormContext } from "react-hook-form";
import { TextField } from "@mui/material";
import { callApi } from "../../../dataprovider/miscApis";
import { calcBookingTotals } from "../../../utils/bookingCalculations";

const PaymentFields = ({ pending, type }) => {
  const mode = useWatch({ name: "mode" });

  const validateAmount = useMemo(
    () => [
      required(),
      maxValue(pending, `Amount cannot be greater than ${pending}`),
      minValue(1, "Min value is 1"),
    ],
    [pending]
  );

  return (
    <>
      <Grid item size={{ lg: 6, xs: 12 }}>
        <TextField value={pending} label="Balance Pending" fullWidth disabled />
      </Grid>

      <Grid item size={{ lg: 6, xs: 12 }}>
        <NumberInput source="amount" fullWidth validate={validateAmount} />
      </Grid>
      {type === "RENT" && (
        <Grid item size={{ lg: 12, xs: 12 }}>
          <RadioButtonGroupInput
            sx={{ mt: 0 }}
            source="mode"
            choices={[
              { id: "CASH", name: "CASH" },
              { id: "ONLINE", name: "ONLINE" },
              { id: "CHEQUE", name: "CHEQUE" },
            ]}
            fullWidth
          />
        </Grid>
      )}
      {mode && mode !== "CASH" && (
        <Grid item size={12}>
          <TextInput source="ref" fullWidth multiline />
        </Grid>
      )}
    </>
  );
};

export default function BookingReceiptForm({ bookingId }) {
  const notify = useNotify();
  const { setValue } = useFormContext();

  const type = useWatch({ name: "type" });
  const totalAmountPending = useWatch({ name: "totalAmountPending" });
  const totalDepositPending = useWatch({ name: "totalDepositPending" });

  useEffect(() => {
    if (!bookingId) return;

    callApi(`bookings/${bookingId}`, {}, "GET")
      .then(({ data }) => {
        if (data.count > 0) {
          const bookingData = data?.rows[0] || {};
          const { totalAmountPending: totalAmount, totalDepositPending: totalDeposit } =
            calcBookingTotals({
              halls: bookingData.hallBookings,
              ...bookingData,
              jamaatLagatUnit: bookingData.bookingPurpose?.jamaatLagat || 0,
              perThaalCost: bookingData.bookingPurpose?.perThaal,
              mohalla: bookingData.mohalla,
            });

          setValue("organiser", bookingData.organiser);
          setValue("organiserIts", bookingData.itsNo);
          setValue("totalAmountPending", totalAmount);
          setValue("totalDepositPending", totalDeposit);
          setValue("mode", "CASH");
        }
      })
      .catch((err) => {
        notify(err.message);
      });
  }, [bookingId, notify, setValue]);

  return (
    <Grid container spacing={1}>
      <Grid item size={{ lg: 6, xs: 12 }}>
        <TextInput source="organiserIts" label="ITS No" fullWidth InputProps={{ readOnly: true }} />
      </Grid>
      <Grid item size={{ lg: 6, xs: 12 }}>
        <TextInput source="organiser" label="Organiser" fullWidth InputProps={{ readOnly: true }} />
      </Grid>

      <Grid item size={12}>
        <RadioButtonGroupInput
          sx={{ mt: 0 }}
          source="type"
          choices={[
            { id: "DEPOSIT", name: "DEPOSIT" },
            { id: "RENT", name: "RENT" },
          ]}
          fullWidth
        />
      </Grid>

      {type && (
        <PaymentFields
          type={type}
          pending={type === "RENT" ? totalAmountPending : totalDepositPending}
        />
      )}
    </Grid>
  );
}
