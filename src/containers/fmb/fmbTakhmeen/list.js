import React from "react";
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  ReferenceField,
  TopToolbar,
  CreateButton,
  Pagination,
  FunctionField,
} from "react-admin";
import { formatFmbHijriPeriod } from "../../../utils/hijriDateUtils";

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
  </TopToolbar>
);

export default function FmbTakhmeenList(props) {
  return (
    <List
      {...props}
      actions={<ListActions />}
      sort={{ field: "startDate", order: "DESC" }}
      perPage={25}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50]} />}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <ReferenceField source="fmbId" reference="fmbData" link="show" label="FMB no.">
          <TextField source="fmbNo" />
        </ReferenceField>
        <TextField source="category" label="Category" />
        <NumberField source="takhmeenAmount" label="Amount" />
        <NumberField source="pendingBalance" label="Pending" />
        <NumberField source="paidBalance" label="Paid" />
        <FunctionField
          label="Hijri period"
          render={(record) =>
            formatFmbHijriPeriod(
              record?.hijriYearStart ?? record?.takhmeenYear,
              record?.hijriYearEnd,
            ) ?? "—"
          }
        />
        <DateField source="startDate" label="Effective" emptyText="—" />
      </Datagrid>
    </List>
  );
}
