import { AutocompleteInput, ReferenceInput } from "react-admin";

const TransferOut = () => (
  <ReferenceInput source="transferTo" reference="mohallas" required>
    <AutocompleteInput label="Transfer To" optionText="id" debounce={300} fullWidth />
  </ReferenceInput>
);

export default TransferOut;
