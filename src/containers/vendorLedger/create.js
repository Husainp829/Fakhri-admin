import React from "react";
import {
  TextInput,
  Create,
  SimpleForm,
  ReferenceInput,
  NumberInput,
  DateInput,
  SelectInput,
  RadioButtonGroupInput,
} from "react-admin";

export default (props) => (
  <Create {...props}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
      <ReferenceInput source="vendorId" reference="vendors">
        <SelectInput fullWidth isRequired optionText="name" />
      </ReferenceInput>
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
  </Create>
);
