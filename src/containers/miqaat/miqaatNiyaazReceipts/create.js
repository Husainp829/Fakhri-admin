/* eslint-disable no-console */
import React from "react";
import { Create, SimpleForm, TextInput, NumberInput, DateInput } from "react-admin";
import MiqaatNiyaazITSLookup from "./common/ITSLookup";
import PaymentModeInput from "./common/PaymentModeInput";

export default (props) => {
  const transform = (data) => ({
    itsNo: data.itsNo,
    name: data.name,
    purpose: data.purpose,
    amount: data.amount,
    receiptDate: data.receiptDate,
    paymentMode: data.paymentMode,
    paymentRef: data.paymentRef,
    remarks: data.remarks,
  });

  const receiptDefaultValues = () => ({
    receiptDate: new Date(),
  });

  return (
    <Create {...props} transform={transform} redirect="list">
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={receiptDefaultValues}
      >
        <MiqaatNiyaazITSLookup />
        <TextInput source="name" label="Name" fullWidth />
        <TextInput source="purpose" label="Purpose" fullWidth />
        <NumberInput source="amount" label="Amount" fullWidth isRequired />
        <DateInput source="receiptDate" label="Receipt Date" fullWidth isRequired />
        <PaymentModeInput />
        <TextInput source="remarks" label="Remarks" fullWidth multiline rows={3} />
      </SimpleForm>
    </Create>
  );
};
