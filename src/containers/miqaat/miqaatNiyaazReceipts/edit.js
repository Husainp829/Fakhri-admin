/* eslint-disable no-console */
import React from "react";
import { useFormContext } from "react-hook-form";
import { Edit, SimpleForm, TextInput, DateInput, SelectInput } from "react-admin";
import MiqaatNiyaazITSLookup from "./common/ITSLookup";
import PaymentModeInput from "./common/PaymentModeInput";
import NoArrowKeyNumberInput from "../../../components/NoArrowKeyNumberInput";

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

export default (props) => (
  <Edit {...props} mutationMode="optimistic" redirect="/">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
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
      <NoArrowKeyNumberInput source="amount" label="Amount" fullWidth isRequired />
      <DateInput source="receiptDate" label="Receipt Date" fullWidth isRequired />
      <PaymentModeInput />
      <TextInput source="paymentRef" label="Payment Reference" fullWidth />
      <TextInput source="remarks" label="Remarks" fullWidth multiline rows={3} />
    </SimpleForm>
  </Edit>
);
