/* eslint-disable no-console */
import React from "react";
import { Edit, useNotify, SimpleForm, useRecordContext, Toolbar, SaveButton } from "react-admin";
import NiyaazForm from "./niyaazForm";

const EditToolbar = () => (
  <Toolbar>
    <SaveButton />
  </Toolbar>
);

export default (props) => {
  const notify = useNotify();
  const onFailure = (error) => {
    notify(`Could not edit post: ${error.message}`);
  };
  const Showtitle = () => {
    const record = useRecordContext();
    return <span>{record ? `Form No. ${record.formNo}` : ""}</span>;
  };

  const validateNiyaazUpdation = (values) => {
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
    return errors;
  };

  return (
    <Edit {...props} onFailure={onFailure} title={<Showtitle />}>
      <SimpleForm
        warnWhenUnsavedChanges
        toolbar={<EditToolbar />}
        validate={validateNiyaazUpdation}
      >
        <NiyaazForm />
      </SimpleForm>
    </Edit>
  );
};
