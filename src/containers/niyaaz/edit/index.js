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

  return (
    <Edit {...props} onFailure={onFailure} title={<Showtitle />}>
      <SimpleForm warnWhenUnsavedChanges toolbar={<EditToolbar />}>
        <NiyaazForm />
      </SimpleForm>
    </Edit>
  );
};
