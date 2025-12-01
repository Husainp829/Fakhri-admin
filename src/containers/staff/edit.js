/* eslint-disable no-console */
import React from "react";
import {
  TextInput,
  Edit,
  SimpleForm,
  SelectInput,
  BooleanInput,
} from "react-admin";
import { EMPLOYEE_TYPE } from "../../constants";

export default (props) => (
  <Edit {...props} mutationMode="optimistic">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
      <TextInput source="name" isRequired fullWidth />
      <TextInput source="phone" isRequired fullWidth />
      <SelectInput
        label="Type"
        source="type"
        key={1}
        choices={Object.entries(EMPLOYEE_TYPE).map(([id, name]) => ({ id, name }))}
        sx={{ marginBottom: 0 }}
        alwaysOn
      />
      <BooleanInput
        label="Receive Booking Summaries via WhatsApp"
        source="receiveBookingSummary"
        fullWidth
        defaultValue={false}
      />
    </SimpleForm>
  </Edit>
);
