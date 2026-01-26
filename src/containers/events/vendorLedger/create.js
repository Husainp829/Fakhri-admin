import React from "react";
import {
  TextInput,
  Create,
  SimpleForm,
  DateInput,
  RadioButtonGroupInput,
} from "react-admin";
import NoArrowKeyNumberInput from "../../../components/NoArrowKeyNumberInput";
import CustomReferenceInput from "../../../components/CustomReferenceInput";

export default (props) => (
  <Create {...props} sx={{ mt: 2 }} redirect="list">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
      <TextInput source="billNo" isRequired fullWidth />
      <DateInput source="billDate" isRequired fullWidth />
      <CustomReferenceInput
        source="vendorId"
        reference="vendors"
        perPage={9999}
        optionText="name"
        fields={[
          { source: "name", label: "Name" },
          { source: "mobile", label: "Mobile" },
        ]}
        defaultKey="name"
        title="Vendor"
        isRequired
      />
      <CustomReferenceInput
        source="type"
        reference="vendorTypes"
        perPage={9999}
        fields={[{ source: "id", label: "Type" }]}
        defaultKey="id"
        title="Type"
      />
      <NoArrowKeyNumberInput source="paid" fullWidth label="Paid Amount" />

      <DateInput source="paidDate" fullWidth />
      <RadioButtonGroupInput
        sx={{ mt: 0 }}
        source="mode"
        choices={[
          { id: "CASH", name: "CASH" },
          { id: "ONLINE", name: "ONLINE" },
          { id: "CHEQUE", name: "CHEQUE" },
        ]}
        fullWidth
      />

      <TextInput source="remarks" fullWidth />
    </SimpleForm>
  </Create>
);
