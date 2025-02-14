/* eslint-disable no-console */
import React from "react";
import { TextInput, Edit, SimpleForm, ReferenceInput, NumberInput, DateInput, RadioButtonGroupInput } from "react-admin";

export default (props) => (
  <Edit {...props} mutationMode="optimistic">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
      <ReferenceInput source="vendorId" reference="vendors" fullWidth isRequired />
      <ReferenceInput source="type" reference="vendorTypes" fullWidth isRequired />
      <NumberInput source="paid" isRequired fullWidth />
      <RadioButtonGroupInput
        sx={{ mt: 0 }}
        source="mode"
        choices={[
          { id: "CASH", name: "CASH" },
          { id: "ONLINE", name: "ONLINE" },
          { id: "CHEQUE", name: "CHEQUE" },
        ]}
        fullWidth
        isRequired
      />
      <DateInput source="date" isRequired fullWidth />
      <TextInput source="remarks" fullWidth />
    </SimpleForm>
  </Edit>
);
