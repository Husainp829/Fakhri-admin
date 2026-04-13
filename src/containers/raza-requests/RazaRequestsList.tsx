import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  ReferenceField,
  type ListProps,
} from "react-admin";

const RazaRequestsList = (props: ListProps) => (
  <List {...props} sort={{ field: "requestDate", order: "DESC" }}>
    <Datagrid rowClick="show">
      <DateField source="razaGranted" label="Raza granted on" emptyText="Pending" />
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
      <DateField source="requestDate" label="Date" />
      <TextField source="lagatReceiptNo" label="Receipt no." emptyText="—" />
    </Datagrid>
  </List>
);

export default RazaRequestsList;
