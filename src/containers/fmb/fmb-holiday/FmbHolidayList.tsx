import React from "react";
import {
  List,
  Datagrid,
  FunctionField,
  TextField,
  TextInput,
  TopToolbar,
  CreateButton,
  ExportButton,
  Pagination,
  DateInput,
  type ListProps,
  type RaRecord,
} from "react-admin";

import { FmbHolidayCsvImportButton } from "./FmbHolidayCsvImportButton";
import { formatListDate } from "@/utils/date-format";

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
        <FunctionField
          label="Holiday date"
          sortBy="holidayDate"
          render={(record: RaRecord) => formatListDate(record?.holidayDate, { empty: "—" })}
        />
        <TextField source="name" emptyText="—" />
      </Datagrid>
    </List>
  );
}
