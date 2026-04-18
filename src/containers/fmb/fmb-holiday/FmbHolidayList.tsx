import React from "react";
import {
  List,
  Datagrid,
  DateField,
  TextField,
  TextInput,
  TopToolbar,
  CreateButton,
  ExportButton,
  Pagination,
  DateInput,
  type ListProps,
} from "react-admin";

import { FmbHolidayCsvImportButton } from "./FmbHolidayCsvImportButton";

const filters = [
  <TextInput key="q" source="q" label="Search holiday name" alwaysOn sx={{ minWidth: 220 }} />,
  <DateInput source="from" label="From" alwaysOn key="from" />,
  <DateInput source="to" label="To" alwaysOn key="to" />,
];

const ListActions = () => (
  <TopToolbar>
    <FmbHolidayCsvImportButton />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export default function FmbHolidayList(props: ListProps) {
  return (
    <List
      {...props}
      sort={{ field: "holidayDate", order: "ASC" }}
      perPage={50}
      pagination={<Pagination rowsPerPageOptions={[25, 50, 100]} />}
      filters={filters}
      filterDefaultValues={{}}
      actions={<ListActions />}
    >
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <DateField source="holidayDate" />
        <TextField source="name" emptyText="—" />
      </Datagrid>
    </List>
  );
}
