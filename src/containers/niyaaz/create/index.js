/* eslint-disable no-console */
import React from "react";
import { Create, SimpleForm, SelectInput, useNotify } from "react-admin";
import NiyaazForm from "./niyaazForm";

export default (props) => {
  const notify = useNotify();
  const onFailure = (error) => {
    console.log(error);
    notify(`Could not edit post: ${error.message}`);
  };
  return (
    <Create {...props} onFailure={onFailure}>
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
        <SelectInput
          source="markaz"
          label="Markaz"
          helperText="Select any one of Zainy Masjid, Burhani Hall"
          choices={[
            { id: "ZM", name: "Zainy Masjid" },
            { id: "BH", name: "Burhani Hall" },
          ]}
          fullWidth
          isRequired
        />
        <NiyaazForm />
      </SimpleForm>
    </Create>
  );
};
