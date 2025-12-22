import React from "react";
import { AutocompleteInput, ReferenceInput } from "react-admin";

export default () => (
  <ReferenceInput source="transferTo" reference="mohallas" required>
    <AutocompleteInput label="Transfer To" optionText="id" debounce={300} fullWidth required />
  </ReferenceInput>
);
