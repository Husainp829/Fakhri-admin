/* eslint-disable no-console */
import React, { useContext } from "react";
import { Create, useNotify, SimpleForm, useRedirect } from "react-admin";
import NiyaazForm from "./niyaazForm";
import { EventContext } from "../../../dataprovider/eventProvider";
import { calcTotalPayable } from "../../../utils";

export default (props) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const onFailure = (error) => {
    notify(`Could not edit post: ${error.message}`);
  };
  const { currentEvent } = useContext(EventContext);

  const validateNiyaazCreation = (values) => {
    const errors = {};
    if (!values.markaz) {
      errors.markaz = "The markaz is required";
    }
    if (!values.HOFId) {
      errors.markaz = "The HOF ITS is required";
    }
    if (!values.HOFName) {
      errors.markaz = "The HOF Name is required";
    }
    // You can add a message for a whole ArrayInput
    if (!values.familyMembers || !values.familyMembers.length) {
      errors.familyMembers = "Atleast 1 Family Member required";
    } else {
      // Or target each child of an ArrayInput by returning an array of error objects
      errors.familyMembers = values.familyMembers.map((member) => {
        const memberErrors = {};
        if (!member?.name) {
          memberErrors.name = "The name is required";
        }
        if (!member?.age) {
          memberErrors.age = "The age is required";
        }
        if (!member?.its) {
          memberErrors.its = "The its is required";
        }
        if (!member?.gender) {
          memberErrors.gender = "The gender is required";
        }
        return memberErrors;
      });
    }
    if (values.paidAmount > 0 && !values.mode) {
      errors.mode = "Payment Mode is Required";
    }
    const totalPayable = calcTotalPayable(currentEvent, values);
    if (values.paidAmount > totalPayable) {
      errors.paidAmount = "Payment Amount cannot be greater than payable";
    }
    return errors;
  };

  const onSuccess = (data) => {
    notify(`Niyaaz form created - ${data.id}`, { autoHideDuration: 5000, type: "success" });
    redirect("/niyaaz");
  };
  return (
    <Create {...props} onFailure={onFailure} redirect="list" mutationOptions={{ onSuccess }}>
      <SimpleForm warnWhenUnsavedChanges validate={validateNiyaazCreation}>
        <NiyaazForm />
      </SimpleForm>
    </Create>
  );
};
