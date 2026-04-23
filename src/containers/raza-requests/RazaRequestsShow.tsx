import {
  Show,
  SimpleShowLayout,
  TextField,
  FunctionField,
  NumberField,
  ReferenceField,
  type ShowProps,
  type RaRecord,
} from "react-admin";
import { formatListDate } from "@/utils/date-format";
import RazaRequestsShowActions from "./RazaRequestsShowActions";

const RazaRequestsShow = (props: ShowProps) => (
  <Show {...props} actions={<RazaRequestsShowActions />}>
    <SimpleShowLayout>
      <FunctionField
        label="Raza granted on"
        render={(record: RaRecord) => formatListDate(record?.razaGranted, { empty: "Pending" })}
      />
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
      <FunctionField
        label="Request date"
        render={(record: RaRecord) => formatListDate(record?.requestDate, { empty: "—" })}
      />
      <TextField source="lagatReceiptNo" label="Lagat receipt no." emptyText="—" />
    </SimpleShowLayout>
  </Show>
);

export default RazaRequestsShow;
