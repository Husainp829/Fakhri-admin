import React from "react";
import {
  TextInput,
  Edit,
  SimpleForm,
  NumberInput,
  DateInput,
  RadioButtonGroupInput,
  useRecordContext,
} from "react-admin";
import CustomReferenceInput from "../../components/CustomReferenceInput";

const PostTitle = () => {
  const record = useRecordContext();
  return <span> {record ? `Ledger-${record.ledgerNo}` : ""}</span>;
};
export default (props) => (
  <Edit {...props} sx={{ mt: 2 }} title={<PostTitle />}>
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
      />
      <CustomReferenceInput
        source="type"
        reference="vendorTypes"
        perPage={9999}
        fields={[{ source: "id", label: "Type" }]}
        defaultKey="id"
        title="Type"
      />
      <NumberInput source="paid" fullWidth />
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
  </Edit>
);
