import React from "react";
import { Create, SimpleForm } from "react-admin";

import CreateForm from "./createForm";
import { useRouteId } from "../../../../utils/routeUtility";

export default (props) => {
  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const niyaazId = searchParams.get("niyaazId");
  const eventId = useRouteId();

  const transform = (data) => ({
    eventId: data.eventId,
    niyaazId: data.niyaazId,
    formNo: data.formNo,
    amount: data.amount,
    mode: data.mode,
    details: data.details,
    markaz: data.markaz,
    namaazVenue: data.namaazVenue,
    HOFId: data.HOFId,
    HOFName: data.HOFName,
  });

  const validateReceiptCreation = (values) => {
    const errors = {};
    if (!values.markaz) {
      errors.markaz = "The markaz is required";
    }
    if (!values.namaazVenue) {
      errors.namaazVenue = "The namaaz venue is required";
    }
    if (!values.HOFId) {
      errors.markaz = "The HOF ITS is required";
    }
    if (!values.HOFName) {
      errors.markaz = "The HOF Name is required";
    }

    if (!values.mode) {
      errors.mode = "Payment Mode is Required";
    }
    const totalPayable = values.totalPayable - values.paidAmount;
    if (values.amount > totalPayable) {
      errors.amount = "Payment Amount cannot be greater than Payable";
    }

    return errors;
  };

  const receiptDefaultValues = () => ({ niyaazId, eventId });
  return (
    <Create {...props} transform={transform} redirect={() => `niyaaz/${niyaazId}/show/receipts`}>
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={receiptDefaultValues}
        validate={validateReceiptCreation}
      >
        <CreateForm niyaazId={niyaazId} />
      </SimpleForm>
    </Create>
  );
};
