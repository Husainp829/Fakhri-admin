import React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  DateInput,
  required,
} from "react-admin";
import NoArrowKeyNumberInput from "../../../components/NoArrowKeyNumberInput";

export default (props) => (
  <Create {...props} redirect="/events">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
      <TextInput source="name" fullWidth validate={required()} />
      <DateInput source="fromDate" fullWidth validate={required()} />
      <DateInput source="toDate" fullWidth validate={required()} />
      <TextInput source="hijriYear" fullWidth validate={required()} helperText="Hijri year (e.g., 1445)" />
      <TextInput
        source="slug"
        fullWidth
        validate={required()}
        helperText="URL-friendly identifier (e.g., ashara-mubaraka-1445)"
      />
      <NoArrowKeyNumberInput source="zabihat" fullWidth helperText="Number of zabihat (optional)" />
      <NoArrowKeyNumberInput source="chairs" fullWidth helperText="Number of chairs (optional)" />
    </SimpleForm>
  </Create>
);
