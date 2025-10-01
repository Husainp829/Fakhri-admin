import React from "react";
import {
  TextInput,
  Create,
  SimpleForm,
  ReferenceInput,
  NumberInput,
  SelectInput,
} from "react-admin";

import LagatITSLookup from "./common/lagatItsLookup";
import PaymentModeInput from "./common/paymentModeInput";

export default (props) => {
  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const bookingId = searchParams.get("bookingId");

  const transform = (data) => ({
    referenceId: bookingId,
    itsNo: data.itsNo,
    name: data.name,
    amount: data.amount,
    paymentMode: data.paymentMode,
    paymentRef: data.paymentRef,
    remarks: data.remarks,
    purpose: data.purpose,
  });

  const receiptDefaultValues = () => ({});
  return (
    <Create {...props} transform={transform}>
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={receiptDefaultValues}
      >
        <LagatITSLookup />
        <TextInput source="name" label="Name" fullWidth />
        <ReferenceInput source="purpose" reference="bookingPurpose" required>
          <SelectInput fullWidth label="Purpose" noOptionsText="Select Purpose" />
        </ReferenceInput>
        <NumberInput source="amount" fullWidth />

        <PaymentModeInput />
        <TextInput source="remarks" fullWidth />
      </SimpleForm>
    </Create>
  );
};
