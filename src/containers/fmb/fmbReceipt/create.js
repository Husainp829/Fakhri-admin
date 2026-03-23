import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  TextInput,
  Create,
  SimpleForm,
  ReferenceInput,
  DateInput,
  RadioButtonGroupInput,
} from "react-admin";
import Grid from "@mui/material/GridLegacy";
import { ITSInput } from "./common/itsInput";
import NoArrowKeyNumberInput from "../../../components/NoArrowKeyNumberInput";

export default function FmbReceiptCreate(props) {
  const [searchParams] = useSearchParams();
  const fmbId = searchParams.get("fmbId") || undefined;
  const fmbTakhmeenId = searchParams.get("fmbTakhmeenId") || undefined;

  const defaultValues = useMemo(
    () => ({
      fmbId,
      fmbTakhmeenId,
      paymentMode: "CASH",
      receiptDate: new Date(),
    }),
    [fmbId, fmbTakhmeenId],
  );

  const optionRenderer = (choice) => `${choice.itsNo}`;

  const transform = (data) => {
    const amount = Number(data.amount);
    const out = {
      fmbId: data.fmbId,
      fmbTakhmeenId: data.fmbTakhmeenId,
      amount: Number.isFinite(amount) ? Math.round(amount) : 0,
      paymentMode: data.paymentMode,
      remarks: data.remarks,
    };
    if (data.receiptDate) {
      const d = data.receiptDate instanceof Date ? data.receiptDate : new Date(data.receiptDate);
      if (!Number.isNaN(d.getTime())) {
        out.receiptDate = d.toISOString();
      }
    }
    return out;
  };

  return (
    <Create {...props} transform={transform}>
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }} defaultValues={defaultValues}>
        <Grid container spacing={1}>
          <Grid item lg={6} xs={6}>
            <ReferenceInput source="fmbId" reference="fmbData" required>
              <ITSInput
                fullWidth
                label="ITS No."
                optionText={optionRenderer}
                shouldRenderSuggestions={(val) => val.trim().length === 8}
                noOptionsText="Enter valid ITS No."
              />
            </ReferenceInput>
            <TextInput source="fmbNo" fullWidth disabled />
            <TextInput source="takhmeenAmount" fullWidth disabled />
            <NoArrowKeyNumberInput source="amount" fullWidth />
            <NoArrowKeyNumberInput source="balancePending" fullWidth disabled />
          </Grid>
          <Grid item lg={6} xs={6}>
            <TextInput source="name" label="FMB Account Holder Name" fullWidth disabled />
            <DateInput source="lastPaidDate" fullWidth disabled />
            <DateInput source="receiptDate" fullWidth />
          </Grid>
        </Grid>

        <RadioButtonGroupInput
          source="paymentMode"
          choices={[
            { id: "CASH", name: "CASH" },
            { id: "ONLINE", name: "ONLINE" },
            { id: "CHEQUE", name: "CHEQUE" },
          ]}
          fullWidth
        />
        <TextInput source="remarks" fullWidth />
        <TextInput source="fmbTakhmeenId" sx={{ display: "none" }} />
      </SimpleForm>
    </Create>
  );
}
