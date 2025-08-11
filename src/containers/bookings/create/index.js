/* eslint-disable no-console */
import React from "react";
import { Create, useNotify, SimpleForm, useRedirect } from "react-admin";
import BookingForm from "./bookingForm";

export default (props) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const onFailure = (error) => {
    notify(`Could not edit post: ${error.message}`);
  };

  const validateBookingCreation = (values) => {
    const errors = {};
    if (!values.organiser) {
      errors.organiser = "The organiser is required";
    }
    if (!values.phone) {
      errors.phone = "The phone number is required";
    }
    if (!values.itsNo) {
      errors.itsNo = "The ITS is required";
    }

    return errors;
  };

  const onSuccess = (data) => {
    notify(`Booking created - ${data.id}`, { autoHideDuration: 5000, type: "success" });
    redirect("/bookings");
  };
  return (
    <Create {...props} onFailure={onFailure} redirect="list" mutationOptions={{ onSuccess }}>
      <SimpleForm warnWhenUnsavedChanges validate={validateBookingCreation}>
        <BookingForm />
      </SimpleForm>
    </Create>
  );
};
