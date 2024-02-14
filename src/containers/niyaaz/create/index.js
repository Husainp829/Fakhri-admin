/* eslint-disable no-console */
import React from "react";
import { Create, useNotify, SimpleForm } from "react-admin";
import NiyaazForm from "./niyaazForm";

export default (props) => {
  const notify = useNotify();
  const onFailure = (error) => {
    notify(`Could not edit post: ${error.message}`);
  };
  return (
    <Create {...props} onFailure={onFailure}>
      <SimpleForm warnWhenUnsavedChanges>
        <NiyaazForm />
      </SimpleForm>
    </Create>
  );
};