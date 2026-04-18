import React from "react";
import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  NumberField,
  TopToolbar,
  CreateButton,
  ExportButton,
  Pagination,
  TextInput,
  type ListProps,
} from "react-admin";
import { formatIsoWeekdayList } from "@/containers/fmb/fmb-iso-weekday-choices";

const filters = [
  <TextInput key="q" source="q" label="Search code or name" alwaysOn sx={{ minWidth: 260 }} />,
];

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export default function FmbDeliveryScheduleProfileList(props: ListProps) {
  return (
    <List
      {...props}
      sort={{ field: "code", order: "ASC" }}
      perPage={25}
      filters={filters}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50]} />}
      actions={<ListActions />}
    >
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="code" />
        <TextField source="name" />
        <FunctionField
          label="Weekdays (ISO)"
          sortable={false}
          render={(record) => formatIsoWeekdayList(record.deliveryWeekdays)}
        />
        <NumberField source="cutoffOffsetDays" emptyText="(default)" />
        <NumberField source="cutoffMinutes" emptyText="(default)" />
      </Datagrid>
    </List>
  );
}
