import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  NumberField,
  ReferenceField,
  type ListProps,
  type RaRecord,
} from "react-admin";
import { formatListDate } from "@/utils/date-format";

const RazaRequestsList = (props: ListProps) => (
  <List {...props} sort={{ field: "requestDate", order: "DESC" }}>
    <Datagrid rowClick="show">
      <FunctionField
        label="Raza granted on"
        sortBy="razaGranted"
        render={(record: RaRecord) => formatListDate(record?.razaGranted, { empty: "Pending" })}
      />
      <TextField source="itsNo" label="ITS" />
      <TextField source="name" label="Name" />
      <ReferenceField source="purpose" reference="bookingPurpose" label="Purpose">
        <TextField source="name" />
      </ReferenceField>
      <NumberField
        source="amount"
        label="Amount"
        options={{ style: "currency", currency: "INR", maximumFractionDigits: 0 }}
      />
      <FunctionField
        label="Date"
        sortBy="requestDate"
        render={(record: RaRecord) => formatListDate(record?.requestDate, { empty: "—" })}
      />
      <TextField source="lagatReceiptNo" label="Receipt no." emptyText="—" />
    </Datagrid>
  </List>
);

export default RazaRequestsList;
