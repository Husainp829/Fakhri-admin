import React from "react";
import {
  TextInput,
  Edit,
  SimpleForm,
  NumberInput,
  DateInput,
  RadioButtonGroupInput,
} from "react-admin";
import CustomReferenceInput from "../../components/CustomReferenceInput";

export default (props) => (
  <Edit {...props} sx={{ mt: 2 }}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
      <CustomReferenceInput
        source="vendorId"
        reference="vendors"
        perPage={9999}
        optionText="name"
        fields={[
          { source: "name", label: "Name" },
          { source: "mobile", label: "Mobile" },
        ]}
        title="Vendor"
      />
      <CustomReferenceInput
        source="type"
        reference="vendorTypes"
        perPage={9999}
        optionText="id"
        fields={[{ source: "id", label: "Type" }]}
        title="Type"
      />
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
