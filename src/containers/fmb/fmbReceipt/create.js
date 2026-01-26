import React from "react";
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

export default (props) => {
  const optionRenderer = (choice) => `${choice.itsNo}`;

  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const fmbId = searchParams.get("fmbId");
  const fmbTakhmeenId = searchParams.get("fmbTakhmeenId");

  const transform = (data) => ({
    fmbId: data.fmbId,
    fmbTakhmeenId: data.fmbTakhmeenId,
    amount: data.amount,
    receiptType: "DEBIT",
    paymentMode: data.paymentMode,
    remarks: data.remarks,
    receiptDate: data.receiptDate,
  });

  const receiptDefaultValues = () => ({ fmbId, fmbTakhmeenId });
  return (
    <Create {...props} transform={transform}>
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={receiptDefaultValues}
      >
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
            <DateInput source="receiptDate" fullWidth defaultValue={new Date()} />
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
      </SimpleForm>
    </Create>
  );
};
