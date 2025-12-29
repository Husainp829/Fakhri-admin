/* eslint-disable no-console */
import React from "react";
import { useFormContext } from "react-hook-form";
import { Create, SimpleForm, TextInput, NumberInput, DateInput, SelectInput } from "react-admin";
import MiqaatNiyaazITSLookup from "./common/ITSLookup";
import PaymentModeInput from "./common/PaymentModeInput";

const ReceiptTypeDependentFields = () => {
  const { watch } = useFormContext();
  const receiptType = watch("receiptType");

  return (
    <>
      {receiptType === "CREDIT" && <MiqaatNiyaazITSLookup />}
      <TextInput source="name" label="Name" fullWidth isRequired />
      {receiptType === "DEBIT" && (
        <TextInput source="itsNo" label="ITS No (Optional - for external vendors)" fullWidth />
      )}
    </>
  );
};

export default (props) => {
  const transform = (data) => ({
    receiptType: data.receiptType,
    itsNo: data.itsNo || null,
    name: data.name,
    purpose: data.purpose,
    amount: data.amount,
    receiptDate: data.receiptDate,
    paymentMode: data.paymentMode || null,
    paymentRef: data.paymentRef || null,
    remarks: data.remarks || null,
  });

  const receiptDefaultValues = () => ({
    receiptDate: new Date(),
    receiptType: "DEBIT",
  });

  return (
    <Create {...props} transform={transform} redirect="list">
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={receiptDefaultValues}
      >
        <SelectInput
          source="receiptType"
          label="Entry Type"
          choices={[
            { id: "CREDIT", name: "CREDIT (Income)" },
            { id: "DEBIT", name: "DEBIT (Expense)" },
          ]}
          fullWidth
          isRequired
        />
        <ReceiptTypeDependentFields />
        <TextInput source="purpose" label="Purpose" fullWidth isRequired />
        <NumberInput source="amount" label="Amount" fullWidth isRequired />
        <DateInput source="receiptDate" label="Receipt Date" fullWidth isRequired />
        <PaymentModeInput />
        <TextInput source="paymentRef" label="Payment Reference" fullWidth />
        <TextInput source="remarks" label="Remarks" fullWidth multiline rows={3} />
      </SimpleForm>
    </Create>
  );
};
