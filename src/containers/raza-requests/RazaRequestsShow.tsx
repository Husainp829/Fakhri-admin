import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  NumberField,
  ReferenceField,
  type ShowProps,
} from "react-admin";
import RazaRequestsShowActions from "./RazaRequestsShowActions";

const RazaRequestsShow = (props: ShowProps) => (
  <Show {...props} actions={<RazaRequestsShowActions />}>
    <SimpleShowLayout>
      <DateField source="razaGranted" label="Raza granted on" emptyText="Pending" />
      <TextField source="itsNo" label="ITS" />
      <TextField source="name" label="Name" />
      <TextField source="address" label="Address" />
      <ReferenceField source="purpose" reference="bookingPurpose" label="Purpose">
        <TextField source="name" />
      </ReferenceField>
      <NumberField
        source="amount"
        label="Amount"
        options={{ style: "currency", currency: "INR" }}
      />
      <DateField source="requestDate" label="Request date" />
      <TextField source="lagatReceiptNo" label="Lagat receipt no." emptyText="—" />
    </SimpleShowLayout>
  </Show>
);

export default RazaRequestsShow;
