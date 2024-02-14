/* eslint-disable no-console */
import React from "react";
import { Edit, useNotify, SimpleForm, useRecordContext } from "react-admin";
import NiyaazForm from "./niyaazForm";

export default (props) => {
  const notify = useNotify();
  const onFailure = (error) => {
    notify(`Could not edit post: ${error.message}`);
  };
  const Showtitle = () => {
    const record = useRecordContext();
    return <span>{record ? `Form No. ${record.formNo}` : ""}</span>;
  };
  return (
    <Edit {...props} onFailure={onFailure} title={<Showtitle />}>
      <SimpleForm warnWhenUnsavedChanges>
        <NiyaazForm />
      </SimpleForm>
    </Edit>
  );
};
