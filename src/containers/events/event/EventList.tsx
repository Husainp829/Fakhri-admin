import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  NumberField,
  EditButton,
  DeleteButton,
  type ListProps,
  type RaRecord,
} from "react-admin";
import { formatListDate } from "@/utils/date-format";

export const EventList = (props: ListProps) => (
  <List {...props} sort={{ field: "fromDate", order: "DESC" }}>
    <Datagrid rowClick="edit">
      <TextField source="name" />
      <TextField source="hijriYear" label="Hijri Year" />
      <TextField source="slug" />
      <FunctionField
        label="From Date"
        sortBy="fromDate"
        render={(record: RaRecord) => formatListDate(record?.fromDate, { empty: "—" })}
      />
      <FunctionField
        label="To Date"
        sortBy="toDate"
        render={(record: RaRecord) => formatListDate(record?.toDate, { empty: "—" })}
      />
      <NumberField source="zabihat" label="Zabihat" />
      <NumberField source="chairs" label="Chairs" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
