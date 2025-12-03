/* eslint-disable no-console */
import React from "react";
import { Create, SimpleForm } from "react-admin";

import CreateForm from "./createForm";

export default (props) => {
  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const bookingId = searchParams.get("bookingId");

  const transform = (data) => ({
    type: data.type,
    organiser: data.organiser,
    organiserIts: data.organiserIts,
    bookingId: data.bookingId,
    amount: data.amount,
    mode: data.mode,
    ref: data.ref,
  });

  const validateReceiptCreation = (values) => {
    const errors = {};

    if (!values.organiserIts) {
      errors.organiserIts = "The ITS is required";
    }
    if (!values.organiser) {
      errors.organiser = "The organiser name is required";
    }

    if (!values.type) {
      errors.type = "Type is Required";
    }

    if (!values.mode) {
      errors.mode = "Payment Mode is Required";
    }
    const totalAmountPending = values.totalAmountPending || 0;
    const totalDepositPending = values.totalDepositPending || 0;
    if (!values.amount) {
      errors.amount = "Payment Amount is required";
    } else if (values.type === "DEPOSIT" && values.amount > totalDepositPending) {
      errors.amount = "Payment Amount cannot be greater than Deposit Pending";
    } else if (values.type === "RENT" && values.amount > totalAmountPending) {
      errors.amount = "Payment Amount cannot be greater than Rent Pending";
    }

    return errors;
  };

  const receiptDefaultValues = () => ({ bookingId });
  return (
    <Create {...props} transform={transform} redirect={() => `bookings/${bookingId}/show/receipts`}>
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={receiptDefaultValues}
        validate={validateReceiptCreation}
      >
        <CreateForm bookingId={bookingId} />
      </SimpleForm>
    </Create>
  );
};
