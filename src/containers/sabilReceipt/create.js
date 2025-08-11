import React from "react";
import {
  TextInput,
  Create,
  SimpleForm,
  ReferenceInput,
  NumberInput,
  DateInput,
  RadioButtonGroupInput,
} from "react-admin";
import Grid from "@mui/material/GridLegacy";
import { ITSInput } from "./common/itsInput";

export default (props) => {
  const optionRenderer = (choice) => `${choice.itsNo} - ${choice.sabilType}`;

  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const sabilId = searchParams.get("sabilId");

  const transform = (data) => ({
    sabilId: data.sabilId,
    amount: data.amount,
    receiptType: "DEBIT",
    paymentMode: data.paymentMode,
    remarks: data.remarks,
    receiptDate: data.receiptDate,
  });

  const receiptDefaultValues = () => ({ sabilId });
  return (
    <Create {...props} transform={transform}>
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={receiptDefaultValues}
      >
        <Grid container spacing={1}>
          <Grid item lg={6} xs={6}>
            <ReferenceInput source="sabilId" reference="sabilData" required>
              <ITSInput
                fullWidth
                label="ITS No."
                optionText={optionRenderer}
                shouldRenderSuggestions={(val) => val.trim().length === 8}
                noOptionsText="Enter valid ITS No."
              />
            </ReferenceInput>
            <TextInput source="sabilNo" fullWidth disabled />
            <TextInput source="takhmeenAmount" fullWidth disabled />
            <NumberInput source="amount" fullWidth />
            <NumberInput source="balancePending" fullWidth disabled />
          </Grid>
          <Grid item lg={6} xs={6}>
            <TextInput source="sabilType" fullWidth disabled />
            <TextInput source="name" label="Sabil Holder Name" fullWidth disabled />
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
