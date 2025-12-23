/* eslint-disable no-console */
import React from "react";
import { Edit, SimpleForm, TextInput, NumberInput, DateInput } from "react-admin";
import MiqaatNiyaazITSLookup from "./common/ITSLookup";
import PaymentModeInput from "./common/PaymentModeInput";

export default (props) => (
  <Edit {...props} mutationMode="optimistic">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
      <MiqaatNiyaazITSLookup />
      <TextInput source="name" label="Name" fullWidth />
      <TextInput source="purpose" label="Purpose" fullWidth />
      <NumberInput source="amount" label="Amount" fullWidth isRequired />
      <DateInput source="receiptDate" label="Receipt Date" fullWidth isRequired />
      <PaymentModeInput />
      <TextInput source="paymentRef" label="Payment Reference" fullWidth />
      <TextInput source="remarks" label="Remarks" fullWidth multiline rows={3} />
    </SimpleForm>
  </Edit>
);
