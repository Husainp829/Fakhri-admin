import React, { useContext, useEffect } from "react";
import {
  TextInput,
  NumberInput,
  DateInput,
  RadioButtonGroupInput,
  useNotify,
  minValue,
  maxValue,
  required,
} from "react-admin";
import Grid from "@mui/material/GridLegacy";
import { useWatch, useFormContext } from "react-hook-form";
import { callApi } from "../../../dataprovider/miscApis";
import { EventContext } from "../../../dataprovider/eventProvider";
import { calcTotalPayable } from "../../../utils";

export default ({ niyaazId }) => {
  const notify = useNotify();

  const { setValue } = useFormContext();
  const amount = useWatch({ name: "amount" });
  const totalPayable = useWatch({ name: "totalPayable" });
  const paidAmount = useWatch({ name: "paidAmount" });
  const { currentEvent } = useContext(EventContext);

  useEffect(() => {
    const getNiyaaz = () => {
      callApi({ location: "niyaaz", method: "GET", id: niyaazId })
        .then(({ data }) => {
          if (data.count > 0) {
            const niyaazData = data?.rows[0] || {};
            setValue("HOFId", niyaazData.HOFId);
            setValue("HOFName", niyaazData.HOFName);
            setValue("formNo", niyaazData.formNo);
            setValue("markaz", niyaazData.markaz);
            setValue("namaazVenue", niyaazData.namaazVenue);
            setValue("totalPayable", calcTotalPayable(currentEvent, niyaazData));
            setValue("paidAmount", niyaazData.paidAmount);
            setValue(
              "balancePending",
              calcTotalPayable(currentEvent, niyaazData) - niyaazData.paidAmount
            );
          }
        })
        .catch((err) => {
          notify(err.message);
        });
    };
    if (niyaazId && currentEvent.name) {
      getNiyaaz();
    }
  }, [niyaazId, currentEvent]);

  useEffect(() => {
    let balance = totalPayable - paidAmount;
    if (amount > balance) {
      balance = 0;
    } else {
      balance -= amount;
    }
    setValue("balancePending", balance);
  }, [amount]);

  const validateAmount = [
    required(),
    maxValue(
      totalPayable - paidAmount,
      `Amount cannot be greater than ${totalPayable - paidAmount}`
    ),
    minValue(0, "Min value is 1"),
  ];

  return (
    <>
      <Grid container spacing={1}>
        <Grid item lg={6} xs={6}>
          <TextInput
            source="HOFId"
            label="HOF ITS"
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput
            source="formNo"
            label="Form No."
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput
            source="markaz"
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput
            source="namaazVenue"
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextInput
            source="HOFName"
            label="Name"
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <NumberInput
            source="totalPayable"
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <NumberInput source="amount" fullWidth validate={validateAmount} />
        </Grid>
        <Grid item lg={6} xs={6}>
          <DateInput
            source="date"
            fullWidth
            defaultValue={new Date()}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <NumberInput
            source="balancePending"
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Grid>
      </Grid>
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
      <TextInput source="details" fullWidth multiline />
    </>
  );
};
